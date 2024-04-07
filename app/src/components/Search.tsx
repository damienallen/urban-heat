import { Autocomplete } from '@mantine/core'
import { ProcessingStatus } from './ProcessingStatus'
import { X } from '@phosphor-icons/react'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useState } from 'react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        flex: 1,
        marginRight: 8,
    },
    input: {
        background: 'none',
        width: '100%',
        '& .mantine-Autocomplete-input': {
            color: '#333',
            border: 'none',
            fontSize: '1.4em',
            '@media (max-width: 720px)': {
                fontSize: '1.4em',
            },
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

    const options = Object.fromEntries(
        app.searchResults.map((r: any) => [`${r.city}, ${r.country_code?.toUpperCase()}`, r])
    )

    return (
        <div className={classes.container}>
            <Autocomplete
                className={classes.input}
                placeholder="Search Cities"
                data={Object.keys(options)}
                value={query}
                onChange={(q: string) => updateQuery(q)}
                onOptionSubmit={(k: string) => {
                    const o = options[k]
                    app.setCity(o.city)
                    app.setCountry(o.country_code.toUpperCase())
                    app.setMapCenter([o.lon, o.lat])
                    app.setBounds(o.boundingbox)
                }}
                color="gray"
                leftSection={<ProcessingStatus />}
                leftSectionWidth={48}
                rightSection={<X size={16} onClick={() => setQuery('')} />}
                comboboxProps={{ transitionProps: { transition: 'fade', duration: 200 } }}
            />
        </div>
    )
})
