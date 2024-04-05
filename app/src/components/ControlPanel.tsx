import { ControlsForm } from './ControlsForm'
import { Legend } from './Legend'
import { OpenButton } from './OpenButton'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        userSelect: 'none',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
        '@media (min-width: 720px)': {
            background: 'rgba(255, 255, 255, 0.85)',
            flex: '0 0 280px',
            margin: 16,
            padding: 12,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
        '@media (max-width: 720px)': {
            flex: 1,
            borderTop: '1px solid rgba(0, 0, 0, 0.2)',
            background: 'rgba(255, 255, 255, 0.8)',
        },
    },
    toggle: {
        fontSize: '1.8em',
        color: '#666',
        flex: 0,
        display: 'flex',
        alignItems: 'flex-end',
        cursor: 'pointer',
        '@media (max-width: 720px)': {
            fontSize: '1.6em',
        },
    },
})

export const ControlPanel = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return ui.showControls ? (
        <div className={classes.container}>
            <ControlsForm />
        </div>
    ) : (
        <div className={classes.container}>
            <OpenButton />
            <Legend />
        </div>
    )
})
