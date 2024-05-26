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
            if (location.pathname === '/') {
                contours.randomizeFeature(false)
            } else {
                contours.featureFromPath(location.pathname)
                document.title = `Urban Heat in ${contours.city}, ${contours.country}`
            }
        }
    }, [app.features, location])

    return null
})
