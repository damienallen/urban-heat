import { LoadingOverlay } from '@mantine/core'
import { Progress } from './Progress'
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

export const MapLoader = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <LoadingOverlay
            className={classes.container}
            visible={!ui.mapLoaded}
            loaderProps={{
                children: <Progress color="white" />,
            }}
            overlayProps={{ color: '#000', backgroundOpacity: 0.4, blur: 2 }}
            transitionProps={{ transition: 'fade', duration: 500 }}
            zIndex={150}
        />
    )
})
