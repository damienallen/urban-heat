import { Autocomplete } from '@mantine/core'
import { XIcon } from '@phosphor-icons/react/X'
import { observer } from 'mobx-react'
import { useState } from 'react'
import { createUseStyles } from 'react-jss'
import { useNavigate } from 'react-router-dom'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        flex: 1,
    },
    input: {
        background: 'none',
        width: '100%',
        '& .mantine-Autocomplete-input': {
            color: '#333',
            border: 'none',
            fontSize: '1.1em',
            '@media (max-width: 720px)': {
                fontSize: '1em',
            },
        },
    },
})

export const Search = observer(() => {
    const { app, contours } = useStores()
    const classes = useStyles()
    const [query, setQuery] = useState<string>('')
    const navigate = useNavigate()

    return (
        <div className={classes.container}>
            <Autocomplete
                className={classes.input}
                placeholder={
                    contours.city && contours.country && !contours.areProcessing
                        ? `${contours.city}, ${contours.country}`
                        : 'Contouring...'
                }
                data={query.length > 1 ? Object.keys(app.cityLookup) : []}
                value={query}
                onChange={(q: string) => setQuery(q)}
                onOptionSubmit={(k: string) => {
                    navigate(`/${app.cityLookup[k]}`)
                }}
                color="gray"
                rightSection={<XIcon size={16} onClick={() => setQuery('')} />}
                comboboxProps={{ transitionProps: { transition: 'fade', duration: 200 } }}
            />
        </div>
    )
})
