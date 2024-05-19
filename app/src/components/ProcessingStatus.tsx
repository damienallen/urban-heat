import { Buildings } from '@phosphor-icons/react/Buildings'
import { Gear } from '@phosphor-icons/react/Gear'

import { Tooltip } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        color: '#333',
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

    return (
        <div className={classes.container}>
            {contours.areProcessing ? (
                <Tooltip label="Generating contours...">
                    <Gear size={28} weight="duotone" className={classes.spin} />
                </Tooltip>
            ) : (
                <Buildings size={28} weight="duotone" />
            )}
        </div>
    )
})
