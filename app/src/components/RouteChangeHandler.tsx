import { observer } from 'mobx-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStores } from '../stores'

// Component to update selected feature on route change
export const RouteChangeHandler = observer(() => {
    const { app, contours } = useStores()
    const location = useLocation()

    useEffect(() => {
        if (app.features) {
            contours.featureFromPath(location.pathname)
        }
    }, [app.features, location])

    return null
})
