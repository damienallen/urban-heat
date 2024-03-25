import { ReactNode } from 'react'
import { createUseStyles } from 'react-jss'

const tooltipBgColor = 'rgba(0, 0, 0, 0.6)'
const tooltipWidth = 80

const useStyles = createUseStyles({
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
