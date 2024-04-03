import { RangeSliderValue } from '@mantine/core'
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
    public city: string = 'Rotterdam'
    public country: string = 'NL'

    public selectedYear: number = 2023
    public availableYears: number[] = linspace(2013, 2023, 1)

    public mapStyle: string = 'dataviz'

    setCity = (value: string) => {
        this.city = value
    }

    setCountry = (value: string) => {
        this.country = value
    }

    setSelectedYear = (value: string) => {
        this.selectedYear = Number(value)
    }

    setMapStyle = (value: string) => {
        this.mapStyle = value
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
    public isProcessing: boolean = true

    public range: RangeSliderValue = [44, 52]
    public step: number = 4

    public minThreshold: number = 30
    public maxThreshold: number = 60

    public layers: any[] = []

    setIsProcessing = (value: boolean) => {
        this.isProcessing = value
    }

    setRange = (value: RangeSliderValue) => {
        this.range = value
    }

    setStep = (value: string) => {
        this.step = Number(value)
    }

    get thresholds() {
        return linspace(this.range[0], this.range[1], this.step)
    }

    processContours = async () => {
        // TODO: only apply if changed

        this.setIsProcessing(true)
        const dataUrl = `https://sites.dallen.dev/urban-heat/zh/max_surface_temp_${this.root.app.selectedYear}.tif`
        this.layers = await contourWorker.startContouring(dataUrl, this.thresholds)
        this.setIsProcessing(false)
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class UIStore {
    public showAbout: boolean = false
    public showControls: boolean = false

    toggleShowAbout = () => {
        this.showAbout = !this.showAbout
    }

    toggleShowControls = () => {
        this.showControls = !this.showControls
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
