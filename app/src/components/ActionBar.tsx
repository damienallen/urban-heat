import {
    PiBuildingsDuotone,
    PiInfoDuotone,
    PiSlidersDuotone,
    PiStackSimpleDuotone,
} from 'react-icons/pi'

import { Search } from './Search'
import { Tooltip } from './Tooltip'
import { createUseStyles } from 'react-jss'

const containerBgColor = 'rgba(255, 255, 255, 0.8)'

const useStyles = createUseStyles({
    container: {
        background: containerBgColor,
        position: 'absolute',
        display: 'flex',
        top: 24,
        right: 24,
        padding: 4,
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        userSelect: 'none',
        zIndex: 400,
    },
    icon: {
        margin: '0 8px',
        fontSize: '1.8em',
        color: '#666',
        flex: 1,
        // cursor: 'pointer',
    },
})

export const ActionBar = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <PiBuildingsDuotone className={classes.icon} />
            <Search />
            <Tooltip text="Base Map">
                <PiStackSimpleDuotone className={classes.icon} />
            </Tooltip>
            <Tooltip text="Settings">
                <PiSlidersDuotone className={classes.icon} />
            </Tooltip>
            <Tooltip text="About UH">
                <PiInfoDuotone className={classes.icon} />
            </Tooltip>
        </div>
    )
}
