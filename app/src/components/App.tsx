import '@mantine/core/styles.css'

import { StoreProvider, useStores } from '../stores'

import { AboutModal } from './AboutModal'
import { ActionBar } from './ActionBar'
import { Controls } from './Controls'
import { MantineProvider } from '@mantine/core'
import { MapCanvas } from './MapCanvas'
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
        },
    },
    bottom: {
        alignItems: 'flex-end',
        '@media (max-width: 720px)': {
            alignItems: 'stretch',
        },
    },
})

export const App = () => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <StoreProvider>
            <MantineProvider defaultColorScheme={ui.colorScheme} theme={ui.theme}>
                <div className={classes.app}>
                    <div className={`${classes.row} ${classes.top}`}>
                        <Title />
                        <ActionBar />
                    </div>
                    <div className={`${classes.row} ${classes.bottom}`}>
                        <Controls />
                    </div>

                    <AboutModal />
                    <MapCanvas />
                </div>
            </MantineProvider>
        </StoreProvider>
    )
}
