import { ReactNode } from 'react'
import { Tooltip } from '@mantine/core'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    tooltip: {
        position: 'relative',
        display: 'flex',
        flex: 0,
    },
    icon: {
        margin: '0 8px',
        fontSize: '1.8em',
        color: '#666',
        flex: 0,
        display: 'flex',
        cursor: 'pointer',
        '@media (max-width: 720px)': {
            fontSize: '1.6em',
        },
    },
})

interface ActionBarItemProps {
    icon: ReactNode
    label: string
}

export const ActionBarItem = (props: ActionBarItemProps) => {
    const classes = useStyles()
    return (
        <Tooltip label={props.label}>
            <span className={classes.icon}>{props.icon}</span>
        </Tooltip>
    )
}
