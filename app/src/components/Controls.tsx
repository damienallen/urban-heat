import { ControlsToggle } from './ControlsToggle'
import { Legend } from './Legend'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        background: '#fff',
        display: 'flex',
        padding: '8px 0',
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 300,
        '@media (min-width: 720px)': {
            flex: 0,
            margin: 16,
            padding: 8,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
    },
})

export const Controls = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    console.log('Year:', app.selectedYear)
    return (
        <div className={classes.container}>
            <ControlsToggle />
            <Legend />
        </div>
    )
})
