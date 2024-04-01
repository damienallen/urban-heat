import React from 'react'
import { linspace } from './geometry/utils'
import { makeAutoObservable } from 'mobx'
import packageJson from '../package.json'

export class Store {
    public app: AppStore
    public ui: UIStore

    constructor() {
        this.app = new AppStore(this)
        this.ui = new UIStore(this)
    }
}

export class AppStore {
    public version: string = packageJson.version
    public city: string = 'Rotterdam'
    public country: string = 'NL'

    public selectedYear: number = 2023
    public availableYears: number[] = linspace(2013, 2023, 1)

    public isContouring: boolean = true
    public contourStart: number = 44
    public contourEnd: number = 48
    public contourStep: number = 2

    setCity = (value: string) => {
        this.city = value
    }

    setCountry = (value: string) => {
        this.country = value
    }

    setIsContouring = (value: boolean) => {
        this.isContouring = value
    }

    get contourThresholds() {
        return linspace(this.contourStart, this.contourEnd, this.contourStep)
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class UIStore {
    public showControls: boolean = false

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
