import { LoadingOverlay, RingProgress, Text } from '@mantine/core'

import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        color: '#fff',
    },
})

const Progress = observer(() => {
    const { ui } = useStores()

    return (
        <RingProgress
            rootColor="#ccc"
            sections={[{ value: ui.loadingProgress, color: '#fff' }]}
            size={120}
            thickness={12}
            roundCaps
            label={
                <Text c="#fff" fw={700} ta="center" size="xl">
                    {ui.loadingProgress}
                </Text>
            }
        />
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
            transitionProps={{ transition: 'fade' }}
        />
    )
})
