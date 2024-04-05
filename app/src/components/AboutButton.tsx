import { Info } from '@phosphor-icons/react'
import { createUseStyles } from 'react-jss'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    tooltip: {
        position: 'relative',
        display: 'flex',
        flex: 0,
    },
    icon: {
        margin: '0 8px',
        flex: 0,
        display: 'flex',
        cursor: 'pointer',
    },
})

export const AboutButton = () => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <span className={classes.icon} onClick={() => ui.toggleShowAbout()}>
            <Info size={32} weight="duotone" />
        </span>
    )
}
