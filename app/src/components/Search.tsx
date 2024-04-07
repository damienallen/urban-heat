import { Autocomplete } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useState } from 'react'
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
        '@media (max-width: 720px)': {
            fontSize: '1.4em',
        },
    },
})

export const Search = observer(() => {
    const { app } = useStores()
    const classes = useStyles()
    const [query, setQuery] = useState<string>('')

    const updateQuery = (q: string) => {
        setQuery(q)
        app.queryLocation(q)
    }

    return (
        <div className={classes.container}>
            <Autocomplete
                className={classes.input}
                placeholder={`${app.city}, ${app.country}`}
                data={app.searchResults}
                value={query}
                onChange={(q: string) => updateQuery(q)}
                onOptionSubmit={(o) => {
                    console.log('Option', o)
                    app.setCity(app.city)
                    app.setCountry(app.country)
                }}
                comboboxProps={{ transitionProps: { transition: 'fade', duration: 200 } }}
            />
        </div>
    )
})
