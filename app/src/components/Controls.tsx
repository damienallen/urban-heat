import { ControlsPanel } from './ControlsPanel'
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
        flex: '1 0 280px',
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 300,
        '@media (min-width: 720px)': {
            flex: '0 0 280px',
            margin: 16,
            padding: 8,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
    },
})

export const Controls = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <ControlsToggle />
            {ui.showControls ? <ControlsPanel /> : <Legend />}
        </div>
    )
})
