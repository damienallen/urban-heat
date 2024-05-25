import { MantineColorScheme, RangeSliderValue, createTheme } from '@mantine/core'

import React from 'react'
import { linspace } from './geometry/utils'
import { makeAutoObservable } from 'mobx'
import packageJson from '../package.json'

const worker = new Worker(new URL('./geometry/contour.worker.ts', import.meta.url), {
    type: 'module',
})

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
    public city: string = ''
    public country: string = ''

    public searchResults: string[] = []
    public urbanExtents: any = undefined

    public mapStyle: string = 'dataviz'
    public mapCenter: [number, number] = [4.478, 51.924]
    public bounds: [[number, number], [number, number]] | undefined = undefined

    setCity = (value: string) => {
        this.city = value
    }

    setCountry = (value: string) => {
        this.country = value
    }

    setMapStyle = (value: string) => {
        this.mapStyle = value
    }

    setMapCenter = (value: [number, number]) => {
        this.mapCenter = value
    }

    setBounds = (bbox: [number, number, number, number]) => {
        this.bounds = [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
        ]
    }

    setUrbanExtents = (value: any) => {
        this.urbanExtents = value
    }

    queryLocation = (query: string) => {
        const geocodeUrl = `https://geocode.urbanheat.app/q/${query}.js`
        debounce(async () => {
            const response = await fetch(geocodeUrl)
            const respJson = await response.json()
            this.searchResults = respJson.results.filter((o: any) => o.type === 'city')
        })
    }

    fetchUrbanExtents = async () => {
        const response = await fetch('urban_extents.geojson')
        this.setUrbanExtents(await response.json())
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

    public range: RangeSliderValue = [44, 48]
    public step: number = 2

    public minThreshold: number = 30
    public maxThreshold: number = 60

    public availableYears: number[] = linspace(2013, 2023, 1)
    public year: number = 2023
    public urau: string = ''

    public annualData: AnnualData[] = []
    public histogram: Histogram = {}
    public mean: number = 0
    public stDev: number = 0
    public median: number = 0
    public min: number = 0
    public max: number = 0

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

    setStep = (value: string | number) => {
        this.step = Number(value)
    }

    setYear = (value: string | number) => {
        this.year = Number(value)
    }

    setUrau = (value: string) => {
        this.urau = value
        this.initUrau()
    }

    setAnnualData = (value: AnnualData[]) => {
        this.annualData = value
    }

    setHistogram = (value: Histogram) => {
        // TODO: how to store this?
        console.log(value)
        // this.setHistogram(value)
    }

    setMean = (value: number) => {
        this.mean = value
    }

    setStDev = (value: number) => {
        this.stDev = value
    }

    setMedian = (value: number) => {
        this.median = value
    }

    setMin = (value: number) => {
        this.min = value
    }

    setMax = (value: number) => {
        this.max = value
    }

    get thresholds() {
        return linspace(this.range[0], this.range[1], this.step)
    }

    get json() {
        return JSON.stringify({
            range: this.range,
            step: this.step,
            year: this.year,
            urau: this.urau,
        })
    }

    setInitialUrau = async () => {
        const urauCode = 'NL037C'
        this.setUrau(urauCode)
    }

    initUrau = async () => {
        const response = await fetch(`${this.apiRoot}/urau/${this.urau}/sources`)
        const respJson = await response.json()
        const source: DataSource = respJson.find(
            (source: DataSource) => source.key === this.sourceKey
        )
        this.setAnnualData(source.data)

        const latestYear = this.annualData.reduce((max, s) => (s.year > max.year ? s : max))
        this.setYear(latestYear.year)
        this.loadAnnualData()
    }

    loadAnnualData = async () => {
        const annualData = this.annualData.find((data: AnnualData) => data.year === this.year)

        if (annualData) {
            this.setMean(annualData.stats.mean)
            this.setStDev(annualData.stats.st_dev)
            this.setMedian(annualData.stats.median)
            this.setMin(annualData.stats.min)
            this.setMax(annualData.stats.max)
            this.setHistogram(annualData.stats.histogram)

            this.setRange([this.mean + this.stDev, this.mean + 2 * this.stDev])
            this.setStep(Math.max(Math.min(Math.floor(this.range[1] - this.range[0]), 5), 2))

            console.log('Loading annual dataset', annualData)
            this.processContours(annualData.url)
        } else {
            console.error(`Unable to find data for year '${this.year}'`)
        }
    }

    processContours = async (url: string) => {
        this.root.ui.setLoadingState('Downloading imagery', 0)
        this.setLastJson()
        this.setAreProcessing(true)

        worker.postMessage({
            url: url,
            thresholds: this.thresholds,
        })
        worker.onmessage = (e: MessageEvent) => {
            if (e.data.type === 'progress') {
                this.root.ui.setLoadingState(e.data.state, e.data.progress)
            } else if (e.data.type === 'result') {
                this.setLayers(e.data.result)
                this.setAreProcessing(false)

                this.root.ui.setLoadingState('Loading contours', 80)
                this.root.ui.setShowControls(false)
            }
        }
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class UIStore {
    public firstLoad: boolean = true
    public loadingProgress: number = 10
    public loadingState: string = 'Loading map'

    public showAbout: boolean = false
    public showControls: boolean = false
    public showStyleMenu: boolean = false

    public colorScheme: MantineColorScheme = 'light'

    setLoadingState = (state: string, progress: number) => {
        this.loadingState = state
        this.loadingProgress = progress
        if (progress === 100) this.firstLoad = false
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

    get showLoadingOverlay() {
        return this.loadingProgress < 100 && this.firstLoad
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

let timer: number
const debounce = (func: any, timeout = 350) => {
    clearTimeout(timer)
    timer = setTimeout(func, timeout)
}
