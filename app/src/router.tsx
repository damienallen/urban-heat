import { App } from './components/App.tsx'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
    {
        path: '*',
        element: <App />,
    },
])
