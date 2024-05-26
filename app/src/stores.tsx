import { MantineColorScheme, RangeSliderValue, createTheme } from '@mantine/core'
import { linspace, slugify } from './utils'

import { MapGeoJSONFeature } from 'maplibre-gl'
import React from 'react'
import { makeAutoObservable } from 'mobx'
import packageJson from '../package.json'
import { router } from './router'

const worker = new Worker(new URL('./contour.worker.ts', import.meta.url), {
    type: 'module',
})

export interface FeatureProperties {
    FID: string
    AREA_SQM: number
    FUA_CODE: string
    URAU_CODE: string
    URAU_CATG: string
    URAU_NAME: string
    CNTR_CODE: string
    NUTS3_2021: string
    CITY_CPTL: string | null
}

interface DataSource {
    key: string
    data: AnnualData[]
}

interface AnnualData {
    year: number
    url: string
    stats: Stats
}

interface Stats {
    histogram: Histogram
    mean: number
    st_dev: number
    median: number
    min: number
    max: number
}

interface Histogram {
    [key: string]: number
}

export class Store {
    public app: AppStore
    public contours: ContoursStore
    public ui: UIStore

    constructor() {
        this.app = new AppStore(this)
        this.contours = new ContoursStore(this)
        this.ui = new UIStore(this)
    }
}

export class AppStore {
    public version: string = packageJson.version

    public cityLookup: { [key: string]: string } = {}
    public urbanExtents: any = undefined
    public mapStyle: string = 'dataviz'

    setMapStyle = (value: string) => {
        this.mapStyle = value
    }

    setUrbanExtents = (value: any) => {
        this.urbanExtents = value

        let lookup: { [key: string]: string } = {}
        for (let feat of this.featureProperties as FeatureProperties[]) {
            const label: string = `${feat.URAU_NAME}, ${feat.CNTR_CODE}`
            lookup[label] = slugify(feat.URAU_NAME)
        }
        this.cityLookup = lookup
    }

    fetchUrbanExtents = async () => {
        const response = await fetch('urban_extents.geojson')
        this.setUrbanExtents(await response.json())
    }

    get features() {
        return this.urbanExtents?.features
    }

    get selectedFeature() {
        return this.features?.find(
            (feat: MapGeoJSONFeature) =>
                feat.properties.URAU_CODE === this.root.contours.selected?.URAU_CODE
        )
    }

    get featureProperties() {
        return this.urbanExtents?.features.map((feat: MapGeoJSONFeature) => feat.properties)
    }

    get styleUrl() {
        const maptilerApiKey = 'wDiAbMXktsF0wdW1skrt'
        return `https://api.maptiler.com/maps/${this.mapStyle}/style.json?key=${maptilerApiKey}`
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class ContoursStore {
    private apiRoot = 'https://api.urbanheat.app'
    private sourceKey = 'max_surface_temp'

    public areProcessing: boolean = true
    public layers: any[] = []
    public lastJson: string = ''

    public range: RangeSliderValue = [1, 3]
    public annualData: AnnualData[] = []

    public year: number = 2023
    public selected: FeatureProperties | null = null

    setAreProcessing = (value: boolean) => {
        this.areProcessing = value
    }

    setLayers = (value: any[]) => {
        this.layers = value
    }

    setLastJson = () => {
        this.lastJson = this.json
    }

    setRange = (value: RangeSliderValue) => {
        this.range = value
    }

    setYear = (value: string | number) => {
        this.year = Number(value)
    }

    setSelected = (properties: FeatureProperties | null) => {
        this.selected = properties
        if (properties !== null) {
            this.initUrau()
        }
    }

    setAnnualData = (value: AnnualData[]) => {
        this.annualData = value
    }

    get availableYears() {
        return this.annualData?.map((data: AnnualData) => data.year).sort((a, b) => a - b)
    }

    get thresholds() {
        if (this.stats) {
            const low = this.stats.mean + this.range[0] * this.stats.st_dev
            const high = this.stats.mean + this.range[1] * this.stats.st_dev
            return linspace(low, high, this.stats.st_dev).map((val: number) => Math.round(val))
        } else {
            return []
        }
    }

    get city() {
        return this.selected?.URAU_NAME
    }

    get country() {
        return this.selected?.CNTR_CODE
    }

    get json() {
        return JSON.stringify({
            range: this.range,
            year: this.year,
            selectedUrau: this.selected,
        })
    }

    get data() {
        const currentDatasetStats = this.annualData.find(
            (data: AnnualData) => data.year === this.year
        )
        return currentDatasetStats
    }

    get stats() {
        return this.data?.stats
    }

    get url() {
        return this.data?.url
    }

    randomizeFeature = (setPath: boolean = true) => {
        const processedCountries = [
            'BE',
            'CH',
            'DE',
            'ES',
            'FR',
            'IE',
            'IS',
            'NL',
            'NO',
            'PL',
            'PT',
        ]

        const cities = this.root.app.featureProperties.filter((feat: FeatureProperties) =>
            processedCountries.includes(feat.URAU_CODE.substring(0, 2))
        )
        const randomCity = cities[Math.floor(Math.random() * cities.length)]

        if (setPath) {
            router.navigate(`/${slugify(randomCity.URAU_NAME)}`)
        } else {
            this.setSelected(randomCity)
        }
    }

    featureFromPath = (path: string) => {
        const cityName = path.replace('/', '')
        const feature = this.root.app.features.find(
            (feat: MapGeoJSONFeature) => slugify(feat.properties.URAU_NAME) === cityName
        )
        if (feature) {
            this.setSelected(feature.properties)
        } else {
            console.log(`Unable to find city '${cityName}', randomizing...`)
            router.navigate('/')
        }
    }

    initUrau = async () => {
        const response = await fetch(`${this.apiRoot}/urau/${this.selected!.URAU_CODE}/sources`)
        const respJson = await response.json()

        this.setAnnualData(
            respJson.find((source: DataSource) => source.key === this.sourceKey).data
        )

        const latestYear = this.annualData.reduce((max, s) => (s.year > max.year ? s : max))
        this.setYear(latestYear.year)
        this.processContours()
    }

    processContours = async () => {
        if (this.stats && this.url) {
            this.setLastJson()
            this.setAreProcessing(true)

            worker.postMessage({
                url: this.url,
                thresholds: this.thresholds,
            })
            worker.onmessage = (e: MessageEvent) => {
                if (e.data.type === 'progress') {
                    console.debug(e.data.state, e.data.progress)
                } else if (e.data.type === 'result') {
                    this.setLayers(e.data.result)
                    this.setAreProcessing(false)
                    this.root.ui.setShowControls(false)
                }
            }
        } else {
            console.error(`Unable to find data for year '${this.year}'`)
        }
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class UIStore {
    public mapLoaded: boolean = false

    public showAbout: boolean = false
    public showControls: boolean = false
    public showStyleMenu: boolean = false

    public colorScheme: MantineColorScheme = 'light'

    setMapLoaded = (value: boolean) => {
        this.mapLoaded = value
    }

    toggleShowAbout = () => {
        this.showAbout = !this.showAbout
    }

    toggleShowControls = () => {
        this.showControls = !this.showControls
    }

    toggleShowStyleMenu = () => {
        this.showStyleMenu = !this.showStyleMenu
    }

    setShowControls = (value: boolean) => {
        this.showControls = value
    }

    toggleColorScheme = () => {
        this.colorScheme = this.colorScheme === 'dark' ? 'light' : 'dark'
    }

    get disableUpdate() {
        return (
            this.root.contours.areProcessing ||
            this.root.contours.lastJson === this.root.contours.json
        )
    }

    get theme() {
        return createTheme({
            primaryColor: 'default',
            colors: {
                default: [
                    '#ffefe5',
                    '#ffddce',
                    '#ffb99c',
                    '#fe9365',
                    '#fe7338',
                    '#fe5e1b',
                    '#fe540c',
                    '#e34400',
                    '#ca3b00',
                    '#b12f00',
                ],
            },
            focusRing: 'never',
        })
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export const store = new Store()
const StoreContext = React.createContext(store)

export const StoreProvider = ({ children }: { children: any }) => (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
)

export const useStores = () => React.useContext(StoreContext)
