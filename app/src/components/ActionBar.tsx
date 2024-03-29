import { PiInfoDuotone, PiSlidersDuotone, PiStackSimpleDuotone } from 'react-icons/pi'

import { ProcessingStatus } from './ProcessingStatus'
import { Search } from './Search'
import { Tooltip } from './Tooltip'
import { createUseStyles } from 'react-jss'

const containerBgColor = 'rgba(255, 255, 255, 0.8)'

const useStyles = createUseStyles({
    viewport: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
    },
    container: {
        background: containerBgColor,
        position: 'absolute',
        display: 'flex',
        width: 420,
        margin: 16,
        padding: 8,
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
        <div className={classes.viewport}>
            <div className={classes.container}>
                <ProcessingStatus />
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
        </div>
    )
}
