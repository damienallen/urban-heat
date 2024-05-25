import {
    Blockquote,
    LoadingOverlay,
    NativeSelect,
    RangeSlider,
    RangeSliderValue,
} from '@mantine/core'

import { ControlsItem } from './ControlsItem'
import { HideButton } from './HideButton'
import { Progress } from './Progress'
import { UpdateButton } from './UpdateButton'
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
        position: 'relative',
        '@media (max-width: 720px)': {
            padding: 16,
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

    return ui.showControls ? (
        <div className={classes.container}>
            <LoadingOverlay
                visible={contours.areProcessing}
                loaderProps={{
                    children: <Progress color="black" />,
                }}
                zIndex={150}
                overlayProps={{ blur: 2 }}
            />

            <Blockquote className={classes.description} color="gray" cite={source} mt="xl">
                Annual maximum land surface temperature (LST).
            </Blockquote>

            <ControlsItem label="Dataset">
                <NativeSelect
                    value="Max. Surface Temp."
                    data={['Max. Surface Temp.']}
                    onChange={(e: React.ChangeEvent) => console.log(e)}
                    disabled={contours.areProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Year">
                <NativeSelect
                    value={contours.year}
                    data={contours.availableYears.map(String)}
                    onChange={(e: React.ChangeEvent) =>
                        contours.setYear((e.currentTarget as HTMLInputElement).value)
                    }
                    disabled={contours.areProcessing}
                />
            </ControlsItem>

            <ControlsItem label="Thresholds">
                <div className={classes.sliderInput}>
                    <RangeSlider
                        label={null}
                        minRange={2}
                        min={0}
                        max={4}
                        marks={[
                            { value: 0, label: 'x̄' },
                            { value: 1 },
                            { value: 2, label: '2σ' },
                            { value: 3 },
                            { value: 4, label: '4σ' },
                        ]}
                        defaultValue={contours.range}
                        onChangeEnd={(range: RangeSliderValue) => contours.setRange(range)}
                        disabled={contours.areProcessing}
                    />
                </div>
            </ControlsItem>

            <div className={classes.actionButtons}>
                <HideButton />
                <UpdateButton />
            </div>
        </div>
    ) : null
})
