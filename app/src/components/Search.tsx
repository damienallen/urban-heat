import { createUseStyles } from 'react-jss'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        flex: 1,
    },
    input: {
        background: 'none',
        fontSize: '1.5em',
        color: '#333',
        outline: 'none',
        border: 'none',
        width: '100%',
    },
})

export const Search = () => {
    const { app } = useStores()
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <input placeholder={`${app.city}, ${app.country}`} className={classes.input} />
        </div>
    )
}
