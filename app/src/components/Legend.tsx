import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    items: {
        display: 'flex',
        flex: 1,
        gap: 16,
        overflowX: 'scroll',
        '@media (max-width: 720px)': {
            padding: '8px 0',
            marginRight: 16,
        },
        '@media (min-width: 720px)': {
            marginLeft: 16,
        },
    },
    threholdItem: {
        flex: '0',
        background: '#f00',
        padding: '4px 8px',
        borderRadius: 4,
        minWidth: 60,
    },
})

export const Legend = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    if (contours.stats == undefined || contours.thresholds.length < 1) {
        return (
            <div className={classes.items}>
                <div
                    key={`placeholder-0`}
                    className={classes.threholdItem}
                    style={{ background: `rgba(255, 0, 0, 0.2)` }}
                />
                <div
                    key={`placeholder-1`}
                    className={classes.threholdItem}
                    style={{ background: `rgba(255, 0, 0, 0.4)` }}
                />
                <div
                    key={`placeholder-2`}
                    className={classes.threholdItem}
                    style={{ background: `rgba(255, 0, 0, 0.6)` }}
                />
            </div>
        )
    }

    let items = []
    for (let ind = 0; ind < contours.thresholds.length; ind++) {
        const opacity = (0.8 * (ind + 1)) / (contours.thresholds.length + 1)
        const tempDifference = Math.round(contours.thresholds[ind] - contours.stats.mean)
        items.push(
            <div
                key={`threshold-${ind}`}
                className={classes.threholdItem}
                style={{ background: `rgba(255, 0, 0, ${opacity})` }}
            >
                +{tempDifference}°C
            </div>
        )
    }

    return <div className={classes.items}>{items}</div>
})
