import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    input: {
        background: 'none',
        fontSize: '1.5em',
        color: '#333',
        outline: 'none',
        border: 'none',
        paddingLeft: 4,
        flex: 1,
    },
})

export const Search = () => {
    const classes = useStyles()
    return <input placeholder="Cities (Europe)" className={classes.input} />
}
