import { NativeSelect, RangeSlider, RangeSliderValue } from '@mantine/core'

import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        marginLeft: 24,
        minWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: 8,
    },
    label: {
        marginRight: 8,
        flex: 2,
    },
    input: {
        flex: 3,
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
    },
})

export const ControlsPanel = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <div className={classes.inputRow}>
                <div className={classes.label}>Visualization</div>
                <div className={classes.input}>
                    <NativeSelect
                        value="Max. Surface Temp."
                        data={['Max. Surface Temp.']}
                        onChange={(e: React.ChangeEvent) => console.log(e)}
                        disabled={true}
                    />
                </div>
            </div>
            <div className={classes.inputRow}>
                <div className={classes.label}>Year</div>
                <div className={classes.input}>
                    <NativeSelect
                        value={app.selectedYear}
                        data={app.availableYears.map(String)}
                        onChange={(e: React.ChangeEvent) =>
                            app.setSelectedYear((e.currentTarget as HTMLInputElement).value)
                        }
                        disabled={app.disableControls}
                    />
                </div>
            </div>
            <div className={classes.inputRow}>
                <div className={classes.label}>Step Size</div>
                <div className={classes.input}>
                    <NativeSelect
                        value={app.contourStep}
                        data={['1', '2', '3', '4', '5']}
                        onChange={(e: React.ChangeEvent) =>
                            app.setContourStep((e.currentTarget as HTMLInputElement).value)
                        }
                        disabled={app.disableControls}
                    />
                </div>
            </div>
            <div className={classes.inputRow}>
                <div className={classes.input}>
                    <RangeSlider
                        minRange={2}
                        min={25}
                        max={50}
                        // step={app.contourStep}
                        defaultValue={app.contourRange}
                        onChangeEnd={(range: RangeSliderValue) => app.setContourRange(range)}
                        disabled={app.disableControls}
                    />
                </div>
            </div>
        </div>
    )
})
