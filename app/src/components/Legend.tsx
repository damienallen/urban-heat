import { PiSlidersDuotone } from 'react-icons/pi'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        background: '#fff',
        display: 'flex',
        padding: '8px 0',
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 400,
        '@media (min-width: 720px)': {
            flex: 0,
            margin: 16,
            padding: 8,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
    },
    icon: {
        fontSize: '1.8em',
        color: '#666',
        flex: '0 0 32px',
        cursor: 'pointer',
        '@media (max-width: 720px)': {
            fontSize: '1.6em',
        },
    },
    items: {
        margin: '0 8px 0 16px',
        display: 'flex',
        flex: 1,
        gap: 16,
    },
    threholdItem: {
        flex: 1,
        display: 'flex',
        gap: 8,
    },
    thresholdColor: {
        flex: 0,
        minWidth: 32,
        background: '#f00',
        borderRadius: 8,
    },
    thresholdText: {
        flex: 1,
    },
})

export const LegendItems = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    let items = []
    for (let ind = 0; ind < app.contourThresholds.length; ind++) {
        items.push(
            <div key={`threshold-${ind}`} className={classes.threholdItem}>
                <div className={classes.thresholdColor} style={{ opacity: 0.2 * (ind + 1) }} />
                <div className={classes.thresholdText}>{app.contourThresholds[ind]}°C</div>
            </div>
        )
    }

    return <div className={classes.items}>{items}</div>
})

export const Legend = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <PiSlidersDuotone className={classes.icon} />
            <LegendItems />
        </div>
    )
}
