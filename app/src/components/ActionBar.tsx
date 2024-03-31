import { PiInfoDuotone, PiSlidersDuotone, PiStackSimpleDuotone } from 'react-icons/pi'

import { ProcessingStatus } from './ProcessingStatus'
import { Search } from './Search'
import { Tooltip } from './Tooltip'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    container: {
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        flex: '0 1',
        width: '100vw',
        padding: '8px 0',
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 400,
        '@media (min-width: 720px)': {
            flex: '0 1 420px',
            margin: 16,
            padding: 8,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
    },
    icon: {
        margin: '0 8px',
        fontSize: '1.8em',
        color: '#666',
        flex: 1,
        cursor: 'pointer',
        '@media (max-width: 720px)': {
            fontSize: '1.6em',
        },
    },
})

export const ActionBar = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <ProcessingStatus />
            <Search />
            <Tooltip text="About">
                <PiInfoDuotone className={classes.icon} />
            </Tooltip>
            <Tooltip text="Base Map">
                <PiStackSimpleDuotone className={classes.icon} />
            </Tooltip>
            <Tooltip text="Settings">
                <PiSlidersDuotone className={classes.icon} />
            </Tooltip>
        </div>
    )
}
