import { ControlsItem } from './ControlsItem'
import { NativeSelect } from '@mantine/core'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

export const StyleSelector = observer(() => {
    const { app, contours } = useStores()

    return (
        <ControlsItem label="Map Style">
            <NativeSelect
                value={app.mapStyle}
                data={[
                    {
                        label: 'Maptiler Basic',
                        value: 'basic-v2',
                    },
                    {
                        label: 'Maptiler Dataviz',
                        value: 'dataviz',
                    },
                    {
                        label: 'Maptiler Bright',
                        value: 'bright-v2',
                    },
                    {
                        label: 'Maptiler Satellite',
                        value: 'satellite',
                    },
                    {
                        label: 'Maptiler Streets',
                        value: 'streets-v2',
                    },
                    {
                        label: 'Maptiler Topo',
                        value: 'topo-v2',
                    },
                ]}
                onChange={(e: React.ChangeEvent) =>
                    app.setMapStyle((e.currentTarget as HTMLInputElement).value)
                }
                disabled={contours.isProcessing}
            />
        </ControlsItem>
    )
})
