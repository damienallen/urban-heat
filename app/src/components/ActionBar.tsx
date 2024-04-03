import { ActionBarItem } from './ActionBarItem'
import { PiInfoDuotone } from 'react-icons/pi'
import { ProcessingStatus } from './ProcessingStatus'
import { Search } from './Search'
import { createUseStyles } from 'react-jss'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        flex: '0 1',
        width: '100vw',
        padding: '8px 0',
        borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 200,
        '@media (min-width: 720px)': {
            flex: '0 1 420px',
            margin: 16,
            padding: 8,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
    },
})

export const ActionBar = () => {
    const { ui } = useStores()
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <ProcessingStatus />
            <Search />
            <ActionBarItem
                label="About"
                icon={<PiInfoDuotone />}
                onClick={() => ui.toggleShowAbout()}
            />
        </div>
    )
}
