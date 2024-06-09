import '@mantine/core/styles.css'

import { StoreProvider, useStores } from '../stores'

import { AboutModal } from './AboutModal'
import { ActionBar } from './ActionBar'
import { ControlPanel } from './ControlPanel'
import { MantineProvider } from '@mantine/core'
import { MapCanvas } from './MapCanvas'
import { MapLoader } from './MapLoader'
import { RouteChangeHandler } from './RouteChangeHandler'
import { Title } from './Title'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    app: {
        top: 0,
        margin: 0,
        padding: 0,
        height: '100dvh',
        width: '100vw',
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '@media (max-width: 720px)': {
            alignItems: 'stretch',
        },
    },
    row: {
        flex: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        '@media (max-width: 720px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-end',
        },
    },
    top: {
        alignItems: 'flex-start',
        '@media (max-width: 720px)': {
            flexDirection: 'column-reverse',
            alignItems: 'center',
        },
    },
    bottom: {
        alignItems: 'flex-end',
        '@media (max-width: 720px)': {
            alignItems: 'stretch',
        },
    },
})

const welcomeText = `%c
██╗   ██╗██████╗ ██████╗  █████╗ ███╗   ██╗
██║   ██║██╔══██╗██╔══██╗██╔══██╗████╗  ██║
██║   ██║██████╔╝██████╔╝███████║██╔██╗ ██║
██║   ██║██╔══██╗██╔══██╗██╔══██║██║╚██╗██║
╚██████╔╝██║  ██║██████╔╝██║  ██║██║ ╚████║
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝
                                           
██╗  ██╗███████╗ █████╗ ████████╗          
██║  ██║██╔════╝██╔══██╗╚══██╔══╝          
███████║█████╗  ███████║   ██║             
██╔══██║██╔══╝  ██╔══██║   ██║             
██║  ██║███████╗██║  ██║   ██║             
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝             
                                           

Curious about what's going on under the hood?\n
Check out the source: https://github.com/damienallen/urban-heat\n
Or browse the swagger: https://api.urbanheat.app/docs\n
`

export const App = () => {
    const { ui } = useStores()
    const classes = useStyles()

    console.log(welcomeText, 'color: #d84100')

    return (
        <StoreProvider>
            <RouteChangeHandler />
            <MantineProvider defaultColorScheme={ui.colorScheme} theme={ui.theme}>
                <div className={classes.app}>
                    <div className={`${classes.row} ${classes.top}`}>
                        <Title />
                        <ActionBar />
                    </div>
                    <div className={`${classes.row} ${classes.bottom}`}>
                        <ControlPanel />
                    </div>

                    <AboutModal />
                    <MapCanvas />

                    <MapLoader />
                </div>
            </MantineProvider>
        </StoreProvider>
    )
}
