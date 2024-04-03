import {
    Blockquote,
    LoadingOverlay,
    NativeSelect,
    RangeSlider,
    RangeSliderValue,
} from '@mantine/core'

import { ApplyButton } from './ApplyButton'
import { CloseButton } from './CloseButton'
import { ControlsItem } from './ControlsItem'
import { StyleSelector } from './StyleSelector'
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
        position: 'relative',
    },
    sliderInput: {
        flex: 3,
        padding: '8px 8px 32px 16px',
    },
    description: {
        margin: '8px 0 !important',
        padding: 8,
        fontSize: '0.8em',
    },
    actionButtons: {
        marginTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
    },
})

export const ControlsPanel = observer(() => {
    const { app, contours, ui } = useStores()
    const classes = useStyles()

    // TODO: dynamic based on range/steps
    const marks = [
        { value: contours.minThreshold, label: `${contours.minThreshold}°C` },
        ...contours.thresholds.map((v: number) => ({ value: v })),
        { value: contours.maxThreshold, label: `${contours.maxThreshold}°C` },
    ]

    const source = (
        <div>
            Source:{' '}
            <a href="https://landsat.gsfc.nasa.gov/article/thermal-infrared-sensor-tirs/">
                Thermal Infrared Sensor
            </a>
        </div>
    )

    return ui.showControls ? (
        <div className={classes.container}>
            <LoadingOverlay
                visible={contours.isProcessing}
                zIndex={500}
                overlayProps={{ radius: 'sm', blur: 2 }}
            />
            <StyleSelector />

            <ControlsItem label="Dataset">
                <NativeSelect
                    value="Max. Surface Temp."
                    data={['Max. Surface Temp.']}
                    onChange={(e: React.ChangeEvent) => console.log(e)}
                    disabled={contours.isProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Year">
                <NativeSelect
                    value={app.selectedYear}
                    data={app.availableYears.map(String)}
                    onChange={(e: React.ChangeEvent) =>
                        app.setSelectedYear((e.currentTarget as HTMLInputElement).value)
                    }
                    disabled={contours.isProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Step Size">
                <NativeSelect
                    value={contours.step}
                    data={['2', '3', '4', '5']}
                    onChange={(e: React.ChangeEvent) =>
                        contours.setStep((e.currentTarget as HTMLInputElement).value)
                    }
                    disabled={contours.isProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Thresholds">
                <div className={classes.sliderInput}>
                    <RangeSlider
                        minRange={2}
                        min={contours.minThreshold}
                        max={contours.maxThreshold}
                        marks={marks}
                        defaultValue={contours.range}
                        onChangeEnd={(range: RangeSliderValue) => contours.setRange(range)}
                        disabled={contours.isProcessing}
                    />
                </div>
            </ControlsItem>

            <Blockquote className={classes.description} color="gray" cite={source} mt="xl">
                Annual maximum land surface temperature (LST).
            </Blockquote>

            <div className={classes.actionButtons}>
                <CloseButton />
                <ApplyButton />
            </div>
        </div>
    ) : null
})
