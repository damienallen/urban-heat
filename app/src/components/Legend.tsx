import { PiSlidersDuotone } from 'react-icons/pi'
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
            background: 'rgba(255, 255, 255, 0.8)',
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

export const Legend = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <Tooltip text="Settings">
                <PiSlidersDuotone className={classes.icon} />
            </Tooltip>
        </div>
    )
}
