import { ActionBar } from './ActionBar'
import { MapCanvas } from './MapCanvas'
import { Title } from './Title'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    app: {
        top: 0,
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%',
        position: 'absolute',
    },
})

export const App = () => {
    const classes = useStyles()
    return (
        <div className={classes.app}>
            <Title />
            <ActionBar />
            <MapCanvas />
        </div>
    )
}
