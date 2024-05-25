import { observer } from 'mobx-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStores } from '../stores'

// Component to update Mobx store on route change
export const RouteChangeHandler = observer(() => {
    const { app } = useStores()
    const location = useLocation()

    useEffect(() => {
        console.log(location.pathname)
        app.setPath(location.pathname)
    }, [location])

    return null
})
