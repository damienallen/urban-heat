import { Button } from '@mantine/core'
import { Gear } from '@phosphor-icons/react'
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

export const UpdateButton = observer(() => {
    const { contours } = useStores()
    const classes = useStyles()

    return (
        <span className={classes.container}>
            <Button
                onClick={() => contours.processContours()}
                rightSection={<Gear size={24} weight="duotone" />}
                disabled={contours.isProcessing}
            >
                Update
            </Button>
        </span>
    )
})