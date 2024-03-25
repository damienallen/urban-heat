import {
    PiBuildingsDuotone,
    PiInfoDuotone,
    PiSlidersDuotone,
    PiStackSimpleDuotone,
} from 'react-icons/pi'

import { ReactNode } from 'react'
import { Search } from './Search'
import { createUseStyles } from 'react-jss'

const containerBgColor = 'rgba(255, 255, 255, 0.9)'

const tooltipBgColor = 'rgba(0, 0, 0, 0.6)'
const tooltipWidth = 80

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
        zIndex: 500,
    },
    icon: {
        margin: '0 8px',
        fontSize: '1.8em',
        color: '#666',
        flex: 1,
        // cursor: 'pointer',
    },
    tooltip: {
        position: 'relative',
        display: 'flex',
        '& .tooltip-text': {
            visibility: 'hidden',
            width: tooltipWidth,
            top: '100%',
            left: '50%',
            marginTop: 12,
            marginLeft: -tooltipWidth / 2 /* Half of the width */,
            backgroundColor: tooltipBgColor,
            color: '#fff',
            textAlign: 'center',
            fontSize: '0.9em',
            padding: '5px 0',
            borderRadius: 8,
            position: 'absolute',
            zIndex: 1,
            opacity: 0,
            transition: 'opacity 0.5s',
        },
        '& .tooltip-text::after': {
            content: '" "',
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            marginLeft: -5,
            borderWidth: 5,
            borderStyle: 'solid',
            borderColor: `transparent transparent ${tooltipBgColor} transparent`,
        },
        '&:hover .tooltip-text': {
            visibility: 'visible',
            opacity: 1,
        },
    },
})

interface TooltipProps {
    children: ReactNode
    text: string
}

export const Tooltip = (props: TooltipProps) => {
    const classes = useStyles()
    return (
        <div className={classes.tooltip}>
            {props.children}
            <span className="tooltip-text">{props.text}</span>
        </div>
    )
}

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
