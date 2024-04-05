import { AboutButton } from './AboutButton'
import { ProcessingStatus } from './ProcessingStatus'
import { Search } from './Search'
import { StyleMenu } from './StyleMenu'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        backdropFilter: 'blur(4px)',
        alignItems: 'center',
        width: '100vw',
        userSelect: 'none',
        zIndex: 100,
        '@media (min-width: 720px)': {
            background: 'rgba(255, 255, 255, 0.85)',
            flex: '0 1 420px',
            margin: 16,
            padding: 8,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
        '@media (max-width: 720px)': {
            background: 'rgba(255, 255, 255, 0.8)',
            flex: '0 1',
            padding: 8,
            borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
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
