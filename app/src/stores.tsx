import { MantineColorScheme, RangeSliderValue, createTheme } from '@mantine/core'

import React from 'react'
import { contourWorker } from './geometry/workers'
import { linspace } from './geometry/utils'
import { makeAutoObservable } from 'mobx'
import packageJson from '../package.json'

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

    queryLocation = (query: string) => {
        const geocodeUrl = `https://geocode.urbanheat.app/q/${query}.js`
        debounce(async () => {
            const response = await fetch(geocodeUrl)
            const respJson = await response.json()
            this.searchResults = respJson.results.filter((o: any) => o.type === 'city')
        })
    }

    fetchUrbanExtents = async () => {
        const response = await fetch('https://api.urbanheat.app/')
        this.urbanExtents = await response.json()
    }

    get styleUrl() {
        // TODO: reset and protect origins for key
        const key = 'bk2NyBkmsa6NdxDbxXvH'
        return `https://api.maptiler.com/maps/${this.mapStyle}/style.json?key=${key}`
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class ContoursStore {
    public areProcessing: boolean = true
    public layers: any[] = []
    public lastJson: string = ''

    public range: RangeSliderValue = [44, 48]
    public step: number = 2

    public minThreshold: number = 30
    public maxThreshold: number = 60

    public availableYears: number[] = linspace(2013, 2023, 1)
    public year: number = 2023

    setIsProcessing = (value: boolean) => {
        this.areProcessing = value
    }

    setLastJson = () => {
        this.lastJson = this.json
    }

    setRange = (value: RangeSliderValue) => {
        this.range = value
    }

    setStep = (value: string) => {
        this.step = Number(value)
    }

    setYear = (value: string) => {
        this.year = Number(value)
    }

    get thresholds() {
        return linspace(this.range[0], this.range[1], this.step)
    }

    get json() {
        return JSON.stringify({
            range: this.range,
            step: this.step,
            year: this.year,
        })
    }

    processContours = async () => {
        this.setLastJson()
        this.setIsProcessing(true)
        const dataUrl = `https://sites.dallen.dev/urban-heat/zh/max_surface_temp_${this.year}.tif`
        this.layers = await contourWorker.startContouring(dataUrl, this.thresholds)
        this.setIsProcessing(false)
        this.root.ui.setShowControls(false)
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class UIStore {
    public showAbout: boolean = false
    public showControls: boolean = false
    public showStyleMenu: boolean = false

    public colorScheme: MantineColorScheme = 'light'

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

let timer: number
const debounce = (func: any, timeout = 350) => {
    clearTimeout(timer)
    timer = setTimeout(func, timeout)
}
