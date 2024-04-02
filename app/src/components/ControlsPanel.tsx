import { NativeSelect, RangeSlider, RangeSliderValue } from '@mantine/core'

import { ApplyButton } from './ApplyButton'
import { CloseButton } from './CloseButton'
import { createUseStyles } from 'react-jss'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    container: {
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
        margin: '4px 0',
    },
    sliderInput: {
        flex: 3,
        padding: '8px 8px 32px 8px',
    },
    description: {
        margin: '16px 0',
        fontSize: '0.8em',
    },
    actionButtons: {
        marginTop: 24,
        display: 'flex',
        justifyContent: 'space-between',
    },
})

export const ControlsPanel = observer(() => {
    const { app, contours, ui } = useStores()
    const classes = useStyles()

    const marks = [
        { value: contours.minThreshold, label: `${contours.minThreshold}°C` },
        { value: 30 },
        { value: 35 },
        { value: 40 },
        { value: contours.maxThreshold, label: `${contours.maxThreshold}°C` },
    ]

    return ui.showControls ? (
        <div className={classes.container}>
            <div className={classes.inputRow}>
                <div className={classes.label}>Dataset:</div>
                <div className={classes.input}>
                    <NativeSelect
                        value="Max. Surface Temp."
                        data={['Max. Surface Temp.']}
                        onChange={(e: React.ChangeEvent) => console.log(e)}
                    />
                </div>
            </div>
            <div className={classes.description}>
                Annual maximum surface temperature from NASA's{' '}
                <a href="https://landsat.gsfc.nasa.gov/article/thermal-infrared-sensor-tirs/">
                    Thermal Infrared Sensor (TIRS)
                </a>{' '}
                onboard Landsat 8/9 missions.
            </div>

            <div className={classes.inputRow}>
                <div className={classes.label}>Thresholds</div>
                <div className={classes.sliderInput}>
                    <RangeSlider
                        minRange={2}
                        min={contours.minThreshold}
                        max={contours.maxThreshold}
                        marks={marks}
                        defaultValue={contours.range}
                        onChangeEnd={(range: RangeSliderValue) => contours.setRange(range)}
                        disabled={contours.disableControls}
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
                        disabled={contours.disableControls}
                    />
                </div>
            </div>
            <div className={classes.inputRow}>
                <div className={classes.label}>Step Size</div>
                <div className={classes.input}>
                    <NativeSelect
                        value={contours.step}
                        data={['2', '3', '4', '5']}
                        onChange={(e: React.ChangeEvent) =>
                            contours.setStep((e.currentTarget as HTMLInputElement).value)
                        }
                        disabled={contours.disableControls}
                    />
                </div>
            </div>
            <div className={classes.inputRow}>
                <div className={classes.label}>Base Map</div>
                <div className={classes.input}>
                    <NativeSelect
                        value="Maptiler Dataviz"
                        data={['Maptiler Dataviz']}
                        onChange={(e: React.ChangeEvent) => console.log(e)}
                        disabled={true}
                    />
                </div>
            </div>
            <div className={classes.actionButtons}>
                <CloseButton />
                <ApplyButton />
            </div>
        </div>
    ) : null
})
