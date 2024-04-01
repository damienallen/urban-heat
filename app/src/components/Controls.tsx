import { Legend } from './Legend'
import { PiSlidersDuotone } from 'react-icons/pi'
import { Tooltip } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        background: '#fff',
        display: 'flex',
        padding: '8px 0',
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 300,
        '@media (min-width: 720px)': {
            flex: 0,
            margin: 16,
            padding: 8,
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 8,
        },
    },
    icon: {
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

export const Controls = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    console.log('Year', app.selectedYear)
    return (
        <div className={classes.container}>
            <Tooltip label="Controls">
                <span className={classes.icon}>
                    <PiSlidersDuotone />
                </span>
            </Tooltip>
            <Legend />
        </div>
    )
})
