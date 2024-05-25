import { Button } from '@mantine/core'
import { Gear } from '@phosphor-icons/react/Gear'
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
    const { contours, ui } = useStores()
    const classes = useStyles()

    return (
        <span className={classes.container}>
            <Button
                onClick={() => contours.loadAnnualData()}
                rightSection={<Gear size={24} weight="duotone" />}
                disabled={ui.disableUpdate}
            >
                Update
            </Button>
        </span>
    )
})
