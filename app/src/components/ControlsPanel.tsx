import { NativeSelect, RangeSlider, RangeSliderValue } from '@mantine/core'
import {
    PiArrowsHorizontalDuotone,
    PiCalendarBlankDuotone,
    PiStackSimpleDuotone,
} from 'react-icons/pi'

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
    icon: {
        fontSize: '1.8em',
    },
    input: {
        flex: 3,
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
    },
    sliderInput: {
        flex: 3,
        padding: '8px 8px 32px 8px',
    },
    description: {
        margin: '16px 0',
        fontSize: '0.8em',
    },
})

export const ControlsPanel = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    const marks = [
        { value: app.minThreshold, label: `${app.minThreshold}°C` },
        { value: 30 },
        { value: 35 },
        { value: 40 },
        { value: app.maxThreshold, label: `${app.maxThreshold}°C` },
    ]

    return (
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
                <div className={classes.icon}>
                    <PiCalendarBlankDuotone />
                </div>
                <div className={classes.label}>Thresholds</div>
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
                <div className={classes.icon}>
                    <PiCalendarBlankDuotone />
                </div>
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
                <div className={classes.icon}>
                    <PiArrowsHorizontalDuotone />
                </div>
                <div className={classes.label}>Step Size</div>
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
            <div className={classes.inputRow}>
                <div className={classes.icon}>
                    <PiStackSimpleDuotone />
                </div>
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
        </div>
    )
})
