import { NativeSelect } from '@mantine/core'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'
const useStyles = createUseStyles({
    container: {
        minHeight: 280,
        display: 'flex',
        flex: 1,
    },
    label: {
        marginRight: 8,
    },
})

export const ControlsPanel = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    console.log('Year:', app.selectedYear)

    return (
        <div className={classes.container}>
            <div className={classes.label}>Selected Year</div>
            <NativeSelect
                value={app.selectedYear}
                onChange={(e: React.ChangeEvent) =>
                    app.setSelectedYear((e.currentTarget as HTMLInputElement).value)
                }
                data={app.availableYears.map(String)}
                disabled={app.disableControls}
            />
        </div>
    )
})
