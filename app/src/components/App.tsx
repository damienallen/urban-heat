import { ActionBar } from './ActionBar'
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
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        '@media (max-width: 720px)': {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
    },
})

export const App = () => {
    const classes = useStyles()
    return (
        <StoreProvider>
            <div className={classes.app}>
                <Title />
                <ActionBar />
                <MapCanvas />
            </div>
        </StoreProvider>
    )
}
