import { PiCaretDoubleDownDuotone, PiSlidersDuotone } from 'react-icons/pi'

import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    icon: {
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

export const ControlsToggle = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <span className={classes.icon} onClick={ui.toggleShowControls}>
            {ui.showControls ? <PiCaretDoubleDownDuotone /> : <PiSlidersDuotone />}
        </span>
    )
})
