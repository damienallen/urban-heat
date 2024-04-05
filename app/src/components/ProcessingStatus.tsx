import { Buildings, Gear } from '@phosphor-icons/react'

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
        padding: '0 8px',
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
        : 'Search major urban areas in Europe'

    return (
        <Tooltip label={tooltipLabel}>
            <div className={classes.container}>
                {contours.isProcessing ? (
                    <Gear size={32} weight="duotone" className={classes.spin} />
                ) : (
                    <Buildings size={32} weight="duotone" />
                )}
            </div>
        </Tooltip>
    )
})
