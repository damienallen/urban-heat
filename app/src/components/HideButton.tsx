import { Button } from '@mantine/core'
import { CaretLineDown } from '@phosphor-icons/react/CaretLineDown'
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

export const HideButton = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <span className={classes.container}>
            <Button
                onClick={ui.toggleShowControls}
                leftSection={<CaretLineDown size={24} weight="duotone" />}
                variant="light"
            >
                Hide
            </Button>
        </span>
    )
})
