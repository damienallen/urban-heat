import { ReactNode } from 'react'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        marginRight: 8,
        flex: 2,
    },
    input: {
        flex: 3,
    },
})

interface ControlsItemProps {
    children: ReactNode
    label: string
}

export const ControlsItem = (props: ControlsItemProps) => {
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <div className={classes.label}>{props.label}</div>
            <div className={classes.input}>{props.children}</div>
        </div>
    )
}
