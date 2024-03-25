import { PiGearDuotone } from 'react-icons/pi'
import { createUseStyles } from 'react-jss'
const containerBgColor = 'rgba(255, 255, 255, 0.9)'

const useStyles = createUseStyles({
    viewport: {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
    },
    status: {
        background: containerBgColor,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.2em',
        color: '#333',
        padding: 16,
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        userSelect: 'none',
        zIndex: 500,
    },
    icon: {
        fontSize: '1.4em',
        animation: 'spin 5s linear infinite',
    },
    text: {
        marginLeft: 8,
    },
})

interface ProcessingStatusProps {
    text: string
}
export const ProcessingStatus = (props: ProcessingStatusProps) => {
    const classes = useStyles()
    return (
        <div className={classes.viewport}>
            <div className={classes.status}>
                <PiGearDuotone className={classes.icon} />
                <span className={classes.text}>{props.text}</span>
            </div>
        </div>
    )
}
