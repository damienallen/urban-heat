import '@mantine/core/styles.css'

import { ActionBar } from './ActionBar'
import { Controls } from './Controls'
import { MantineProvider } from '@mantine/core'
import { MapCanvas } from './MapCanvas'
import { StoreProvider } from '../stores'
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
    },
    row: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        '@media (max-width: 720px)': {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
    },
    top: {
        alignItems: 'flex-start',
    },
    bottom: {
        alignItems: 'flex-end',
    },
})

export const App = () => {
    const classes = useStyles()
    return (
        <StoreProvider>
            <MantineProvider>
                <div className={classes.app}>
                    <div className={`${classes.row} ${classes.top}`}>
                        <Title />
                        <ActionBar />
                    </div>
                    <div className={`${classes.row} ${classes.bottom}`}>
                        <Controls />
                    </div>
                    <MapCanvas />
                </div>
            </MantineProvider>
        </StoreProvider>
    )
}
