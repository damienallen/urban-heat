import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef, useState } from 'react'

import { createUseStyles } from 'react-jss'
import maplibregl from 'maplibre-gl'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    map: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 100,
    },
})

export const MapCanvas = observer(() => {
    const { app, contours } = useStores()
    const classes = useStyles()

    const mapContainer = useRef(null)
    const map = useRef(null)

    const [contourLayerIds, setContourLayerIds] = useState<string[]>([])

    const loadContours = (layers: any[]) => {
        if (map.current) {
            const currentMap: maplibregl.Map = map.current

            // Remove existing layers and sources
            const orderedLayerIds = [...currentMap.getLayersOrder().values()]
            for (let id of contourLayerIds) {
                if (orderedLayerIds.includes(id)) {
                    currentMap.removeLayer(id)
                    currentMap.removeSource(id)
                }
            }

            // Add contour layers
            let idList = []
            for (let contourGeojson of layers) {
                const layerId = `contour-${contourGeojson.threshold}`
                idList.push(layerId)

                currentMap.addSource(layerId, {
                    type: 'geojson',
                    data: contourGeojson,
                })
                currentMap.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: layerId,
                    layout: {},
                    paint: {
                        'fill-color': '#f00',
                        'fill-opacity': 0.2,
                    },
                })
            }

            setContourLayerIds(idList)
            console.debug(`${layers.length} contour layers added`)
        }
    }

    useEffect(() => {
        if (map.current) return

        console.log('Initializing map...')
        map.current = new maplibregl.Map({
            container: mapContainer.current || '',
            style: app.styleUrl,
            center: [4.478, 51.924],
            zoom: 10,
        }) as any
        ;(map.current as any).on('load', () => {
            console.log('Map loaded successfully')
            contours.processContours()
        })
    }, [])

    useEffect(() => {
        if (!contours.isProcessing) {
            loadContours(contours.layers)
        }
    }, [contours.layers])

    useEffect(() => {
        if (map.current && !contours.isProcessing) {
            const currentMap: maplibregl.Map = map.current
            currentMap.setStyle(app.styleUrl, { diff: false })
            currentMap.on('style.load', () => {
                loadContours(contours.layers)
            })
        }
    }, [app.styleUrl])

    return (
        <>
            <div ref={mapContainer} className={classes.map} />
        </>
    )
})
