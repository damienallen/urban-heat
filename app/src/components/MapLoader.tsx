import { LoadingOverlay, RingProgress } from '@mantine/core'

import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        color: '#fff',
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

const Progress = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <RingProgress
                className={classes.state}
                rootColor="#ccc"
                sections={[{ value: ui.loadingProgress, color: '#fff' }]}
                size={72}
                thickness={8}
                roundCaps
            />
            <div className={classes.state}>{ui.loadingState}...</div>
        </div>
    )
})

export const MapLoader = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <LoadingOverlay
            className={classes.container}
            visible={ui.isLoading}
            loaderProps={{
                children: <Progress />,
            }}
            overlayProps={{ color: '#000', backgroundOpacity: 0.4, blur: 2 }}
            transitionProps={{ transition: 'fade', duration: 500 }}
        />
    )
})
