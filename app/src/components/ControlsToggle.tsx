import { PiSlidersDuotone } from 'react-icons/pi'
import { Tooltip } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    icon: {
        fontSize: '1.8em',
        color: '#666',
        flex: 0,
        display: 'flex',
        cursor: 'pointer',
        '@media (max-width: 720px)': {
            fontSize: '1.6em',
        },
    },
})

export const ControlsToggle = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    console.log('Show controls:', ui.showControls)

    return (
        <Tooltip label={ui.showControls ? 'Hide Controls' : 'Show Controls'}>
            <span className={classes.icon} onClick={ui.toggleShowControls}>
                <PiSlidersDuotone />
            </span>
        </Tooltip>
    )
})
