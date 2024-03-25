import {
    PiBuildingsDuotone,
    PiInfoDuotone,
    PiSlidersDuotone,
    PiStackSimpleDuotone,
} from 'react-icons/pi'

import { PropsWithChildren } from 'react'
import { Search } from './Search'
import { createUseStyles } from 'react-jss'

const backgroundColor = 'rgba(255, 255, 255, 0.9)'

const useStyles = createUseStyles({
    container: {
        background: backgroundColor,
        position: 'absolute',
        display: 'flex',
        top: 16,
        right: 24,
        padding: 8,
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        userSelect: 'none',
        zIndex: 500,
    },
    icon: {
        margin: '0 8px',
        fontSize: '1.8em',
        color: '#666',
        flex: 1,
    },
    button: {
        background: 'hotPink',
    },
})

export const IconButton = (props: PropsWithChildren) => {
    const classes = useStyles()
    return <div className={classes.button}>{props.children}</div>
}

export const ActionBar = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <PiBuildingsDuotone className={classes.icon} />
            {/* <IconButton>
                <PiBuildingsDuotone className={classes.icon} />
            </IconButton> */}
            <Search />
            <PiStackSimpleDuotone className={classes.icon} />
            <PiSlidersDuotone className={classes.icon} />
            <PiInfoDuotone className={classes.icon} />
        </div>
    )
}
