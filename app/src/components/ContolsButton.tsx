import { Button, Tooltip } from '@mantine/core'

import { PiSlidersDuotone } from 'react-icons/pi'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
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
    icon: {
        fontSize: '1.8em',
    },
})

export const ControlsButton = observer(() => {
    const { contours, ui } = useStores()
    const classes = useStyles()

    return ui.showControls ? null : (
        <span className={classes.container}>
            <Tooltip label="Controls">
                <Button
                    onClick={ui.toggleShowControls}
                    variant="light"
                    disabled={contours.isProcessing}
                >
                    <PiSlidersDuotone className={classes.icon} />
                </Button>
            </Tooltip>
        </span>
    )
})