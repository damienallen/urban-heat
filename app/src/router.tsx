import { createBrowserRouter } from 'react-router-dom'
import { App } from './components/App.tsx'
import { SiteMap } from './components/SiteMap.tsx'

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
