import { PiBuildingsDuotone, PiGearDuotone } from 'react-icons/pi'

import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        color: '#666',
        padding: '0 8px',
    },
    icon: {
        fontSize: '1.4em',
        flex: 1,
    },
    spin: {
        animation: 'spin 5s linear infinite',
    },
})

export const ProcessingStatus = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            {app.isContouring ? (
                <PiGearDuotone className={`${classes.icon} ${classes.spin}`} />
            ) : (
                <PiBuildingsDuotone className={classes.icon} />
            )}
        </div>
    )
})
