import React from 'react'
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
    public isContouring: boolean = true

    setCity = (value: string) => {
        this.city = value
    }

    setCountry = (value: string) => {
        this.country = value
    }

    setIsContouring = (value: boolean) => {
        this.isContouring = value
    }

    constructor(public root: Store) {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export class UIStore {
    public isContouring: boolean = true

    setIsContouring = (value: boolean) => {
        this.isContouring = value
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
