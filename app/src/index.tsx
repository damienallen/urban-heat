import './index.css'

import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { App } from './components/App.tsx'
import ReactDOM from 'react-dom/client'

const router = createBrowserRouter([
    {
        path: '*',
        element: <App />,
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
