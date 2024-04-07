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

    const tooltipLabel = contours.areProcessing
        ? 'Generating contours...'
        : 'Search European cities'

    return (
        <Tooltip label={tooltipLabel}>
            <div className={classes.container}>
                {contours.areProcessing ? (
                    <Gear size={28} weight="duotone" className={classes.spin} />
                ) : (
                    <Buildings size={28} weight="duotone" />
                )}
            </div>
        </Tooltip>
    )
})
