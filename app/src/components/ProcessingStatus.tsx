import { PiBuildingsDuotone, PiGearDuotone } from 'react-icons/pi'

import { Tooltip } from '@mantine/core'
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
        fontSize: '1.8em',
        flex: 1,
        '@media (max-width: 720px)': {
            fontSize: '1.6em',
        },
    },
    spin: {
        animation: 'spin 5s linear infinite',
    },
})

export const ProcessingStatus = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    const tooltipLabel = contours.isProcessing
        ? 'Generating contours...'
        : 'Search cities in Europe'

    return (
        <Tooltip label={tooltipLabel}>
            <div className={classes.container}>
                {contours.isProcessing ? (
                    <PiGearDuotone className={`${classes.icon} ${classes.spin}`} />
                ) : (
                    <PiBuildingsDuotone className={classes.icon} />
                )}
            </div>
        </Tooltip>
    )
})
