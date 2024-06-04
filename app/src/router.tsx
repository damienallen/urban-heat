import { App } from './components/App.tsx'
import { SiteMap } from './components/SiteMap.tsx'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
    {
        path: '/sitemap',
        element: <SiteMap />,
    },
    {
        path: '*',
        element: <App />,
    },
])
