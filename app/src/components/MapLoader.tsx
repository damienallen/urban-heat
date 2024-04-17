import '@mantine/core/styles.css'

import { LoadingOverlay } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        color: '#fff',
    },
})

export const MapLoader = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <LoadingOverlay
            className={classes.container}
            visible={ui.isLoading}
            loaderProps={{ children: 'Loading...' }}
            overlayProps={{ color: '#000', backgroundOpacity: 0.4, blur: 2 }}
            transitionProps={{ transition: 'fade' }}
        />
    )
})
