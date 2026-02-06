import { Loader } from '@mantine/core'
import { observer } from 'mobx-react'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    state: {
        flex: 1,
    },
})

interface ProgressProps {
    color: string
}

export const Progress = observer((props: ProgressProps) => {
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <Loader size={64} color="#fff" type="dots" />
            <div className={classes.state} style={{ color: props.color }}>
                Loading map...
            </div>
        </div>
    )
})
