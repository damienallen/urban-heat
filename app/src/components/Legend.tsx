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
    },
})

export const Legend = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    if (contours.stats == undefined) {
        return undefined
    }

    let items = []
    for (let ind = 0; ind < contours.thresholds.length; ind++) {
        const opacity = (0.8 * (ind + 1)) / (contours.thresholds.length + 1)
        const tempDifference = (contours.thresholds[ind] - contours.stats.mean).toFixed(0)
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
