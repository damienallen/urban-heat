import { RingProgress } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ring: {
        flex: 1,
    },
    state: {
        flex: 1,
    },
})

interface ProgressProps {
    color: string
}

export const Progress = observer((props: ProgressProps) => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <RingProgress
                className={classes.state}
                rootColor="#ccc"
                sections={[{ value: ui.loadingProgress, color: props.color }]}
                size={72}
                thickness={8}
                roundCaps
            />
            <div className={classes.state} style={{ color: props.color }}>
                {ui.loadingState}...
            </div>
        </div>
    )
})
