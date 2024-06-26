import { AboutButton } from './AboutButton'
import { ProcessingStatus } from './ProcessingStatus'
import { Search } from './Search'
import { StyleMenu } from './StyleMenu'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    container: {
        background: 'rgba(255, 255, 255, 0.6)',
        display: 'flex',
        backdropFilter: 'blur(4px)',
        alignItems: 'center',
        width: '100vw',
        userSelect: 'none',
        zIndex: 100,
        flex: '0 1',
        padding: '8px 0',
        borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
        '@media (min-width: 720px)': {
            flex: '0 1 420px',
            margin: 16,
            padding: '8px 4px',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
    },
})

export const ActionBar = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <ProcessingStatus />
            <Search />
            <StyleMenu />
            <AboutButton />
        </div>
    )
}
