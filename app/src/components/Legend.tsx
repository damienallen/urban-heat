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
        flex: '0',
        background: '#f00',
        padding: '4px 8px',
        borderRadius: 8,
    },
})

export const Legend = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    let items = []
    for (let ind = 0; ind < contours.thresholds.length; ind++) {
        items.push(
            <div
                key={`threshold-${ind}`}
                className={classes.threholdItem}
                style={{ background: `rgba(255, 0, 0, ${0.2 * (ind + 1)})` }}
            >
                {contours.thresholds[ind]}°C
            </div>
        )
    }

    return <div className={classes.items}>{items}</div>
})
