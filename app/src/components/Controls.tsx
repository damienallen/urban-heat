import { ControlsPanel } from './ControlsPanel'
import { Legend } from './Legend'
import { PiSlidersDuotone } from 'react-icons/pi'
import { Tooltip } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        background: '#fff',
        display: 'flex',
        padding: 8,
        flex: 1,
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 300,
        '@media (min-width: 720px)': {
            flex: '0 0 280px',
            margin: 16,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
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

export const Controls = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return ui.showControls ? (
        <div className={classes.container}>
            <ControlsPanel />
        </div>
    ) : (
        <div className={classes.container}>
            <Tooltip label="Controls">
                <span className={classes.toggle} onClick={ui.toggleShowControls}>
                    {ui.showControls ? null : <PiSlidersDuotone />}
                </span>
            </Tooltip>
            <Legend />
        </div>
    )
})
