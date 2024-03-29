import { createUseStyles } from 'react-jss'
import { useStores } from '../stores'

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
    const { app } = useStores()
    const classes = useStyles()
    return <input placeholder={`${app.city}, ${app.country}`} className={classes.input} />
}
