import { ControlsForm } from './ControlsForm'
import { Legend } from './Legend'
import { OpenButton } from './OpenButton'
import clsx from 'clsx'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        background: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        userSelect: 'none',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
        '@media (min-width: 720px)': {
            flex: '0 0 280px',
            margin: 16,
            padding: 12,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
        '@media (max-width: 720px)': {
            flex: 1,
            borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        },
    },
    ios: {
        paddingBottom: 18,
    },
})

export const ControlPanel = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    const isIOS = /iPhone|iPod|iPad/.test(navigator.platform)
    console.log('iOS', isIOS)

    const containerClass = clsx({
        [classes.container]: true,
        [classes.ios]: isIOS,
    })
    return ui.showControls ? (
        <div className={containerClass}>
            <ControlsForm />
        </div>
    ) : (
        <div className={containerClass}>
            <OpenButton />
            <Legend />
        </div>
    )
})
