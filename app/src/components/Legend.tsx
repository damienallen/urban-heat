import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    items: {
        margin: '0 8px 0 24px',
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

export const Legend = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    let items = []
    for (let ind = 0; ind < contours.thresholds.length; ind++) {
        items.push(
            <div key={`threshold-${ind}`} className={classes.threholdItem}>
                <div className={classes.thresholdColor} style={{ opacity: 0.2 * (ind + 1) }} />
                <div className={classes.thresholdText}>{contours.thresholds[ind]}°C</div>
            </div>
        )
    }

    return <div className={classes.items}>{items}</div>
})
