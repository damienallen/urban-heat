import { PiMagnifyingGlassDuotone, PiQuestionDuotone, PiSlidersDuotone } from 'react-icons/pi'

import { Search } from './Search'
import { createUseStyles } from 'react-jss'

const backgroundColor = 'rgba(255, 255, 255, 0.9)'

const useStyles = createUseStyles({
    container: {
        background: backgroundColor,
        position: 'absolute',
        top: 16,
        right: 24,
        padding: 8,
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        userSelect: 'none',
        zIndex: 500,
    },
    icon: {
        margin: '4px 8px 0 8px',
        fontSize: '1.4em',
        color: '#666',
    },
})

export const ActionBar = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <PiMagnifyingGlassDuotone className={classes.icon} />
            <Search />
            <PiSlidersDuotone className={classes.icon} />
            <PiQuestionDuotone className={classes.icon} />
        </div>
    )
}
