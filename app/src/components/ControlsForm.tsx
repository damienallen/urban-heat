import { Blockquote, NativeSelect, RangeSlider, RangeSliderValue } from '@mantine/core'
import { observer } from 'mobx-react'
import { createUseStyles } from 'react-jss'
import { useStores } from '../stores'
import { ControlsItem } from './ControlsItem'
import { HideButton } from './HideButton'

const useStyles = createUseStyles({
    container: {
        minWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: 8,
        position: 'relative',
        '@media (max-width: 720px)': {
            padding: 8,
        },
    },
    sliderInput: {
        flex: 3,
        padding: '8px 8px 32px 16px',
    },
    description: {
        margin: '0 0 8px 0 !important',
        padding: 8,
        fontSize: '0.8em',
    },
    actionButtons: {
        marginTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
    },
})

export const ControlsForm = observer(() => {
    const { contours, ui } = useStores()
    const classes = useStyles()

    const source = (
        <div>
            Source:{' '}
            <a href="https://landsat.gsfc.nasa.gov/article/thermal-infrared-sensor-tirs/">
                NASA Landsat: Thermal Infrared Sensor
            </a>
        </div>
    )

    return (
        <div className={classes.container}>
            <Blockquote className={classes.description} color="gray" cite={source} mt="xl">
                Annual maximum land surface temperature (LST).
            </Blockquote>

            <ControlsItem label="Dataset">
                <NativeSelect
                    value="Max. Surface Temp."
                    data={['Max. Surface Temp.']}
                    onChange={(e) => console.log(e)}
                    disabled={contours.areProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Year">
                <NativeSelect
                    value={contours.year}
                    data={contours.availableYears.map(String)}
                    onChange={(e) => contours.setYear(e.currentTarget.value)}
                    disabled={contours.areProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Reference">
                <NativeSelect
                    value={ui.absoluteReference ? 'absolute' : 'relative'}
                    data={[
                        { label: 'Absolute', value: 'absolute' },
                        { label: 'Relative to Mean', value: 'relative' },
                    ]}
                    onChange={(e) => ui.setAbsoluteReference(e.currentTarget.value === 'absolute')}
                    disabled={contours.areProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Thresholds">
                <div className={classes.sliderInput}>
                    <RangeSlider
                        label={null}
                        step={0.5}
                        minRange={1}
                        maxRange={2}
                        min={0}
                        max={3}
                        marks={[
                            { value: 0.0, label: 'mean' },
                            { value: 0.5 },
                            { value: 1.0, label: 'σ' },
                            { value: 1.5 },
                            { value: 2.0, label: '2σ' },
                            { value: 2.5 },
                            { value: 3.0, label: '3σ' },
                        ]}
                        defaultValue={contours.range}
                        onChangeEnd={(range: RangeSliderValue) => contours.setRange(range)}
                        disabled={contours.areProcessing}
                    />
                </div>
            </ControlsItem>

            <div className={classes.actionButtons}>
                <HideButton />
            </div>
        </div>
    )
})
