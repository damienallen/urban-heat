import { NativeSelect, RangeSlider, RangeSliderValue } from '@mantine/core'

import { createUseStyles } from 'react-jss'
import { linspace } from '../geometry/utils'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
        marginLeft: 24,
        minWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: 8,
        padding: 8,
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
    sliderInput: {
        flex: 1,
        padding: '16px 8px 32px 8px',
        borderBottom: '1px dotted rgba(0, 0, 0, 0.4)',
        marginBottom: 8,
    },
})

export const ControlsPanel = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    const marks = linspace(app.minThreshold, app.maxThreshold, 10).map((threshold: number) => ({
        value: threshold,
        label: `${threshold}°C`,
    }))

    return (
        <div className={classes.container}>
            <div>
                <div className={classes.label}>Contour Range:</div>
                <div className={classes.sliderInput}>
                    <RangeSlider
                        minRange={2}
                        min={app.minThreshold}
                        max={app.maxThreshold}
                        marks={marks}
                        defaultValue={app.contourRange}
                        onChangeEnd={(range: RangeSliderValue) => app.setContourRange(range)}
                        disabled={app.disableControls}
                    />
                </div>
            </div>
            <div className={classes.inputRow}>
                <div className={classes.label}>Visualization:</div>
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
                <div className={classes.label}>Year:</div>
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
                <div className={classes.label}>Step Size:</div>
                <div className={classes.input}>
                    <NativeSelect
                        value={app.contourStep}
                        data={['2', '3', '4', '5']}
                        onChange={(e: React.ChangeEvent) =>
                            app.setContourStep((e.currentTarget as HTMLInputElement).value)
                        }
                        disabled={app.disableControls}
                    />
                </div>
            </div>
        </div>
    )
})
