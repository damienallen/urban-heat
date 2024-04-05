import { Button } from '@mantine/core'
import { FloppyDisk } from '@phosphor-icons/react'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        fontSize: '1.8em',
        color: '#666',
        flex: 0,
        display: 'flex',
        alignItems: 'flex-end',
        cursor: 'pointer',
        '@media (max-width: 720px)': {
            fontSize: '1.6em',
        },
    },
})

export const ApplyButton = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    return (
        <span className={classes.container}>
            <Button
                onClick={() => contours.processContours()}
                rightSection={<FloppyDisk size={24} weight="duotone" />}
                disabled={contours.isProcessing}
            >
                Apply
            </Button>
        </span>
    )
})
