import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef, useState } from 'react'

import { contourWorker } from '../geometry/workers'
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

    const [layerIds, setLayerIds] = useState<string[]>([])

    // TODO: reset and protect origins for key
    const baseMapStyleUrl = `https://api.maptiler.com/maps/${app.baseMapId}/style.json?key=bk2NyBkmsa6NdxDbxXvH`

    const loadContours = async (layers: any[]) => {
        if (map.current) {
            const currentMap: maplibregl.Map = map.current

            // Remove existing layers and sources
            for (let id of layerIds) {
                currentMap.removeLayer(id)
                currentMap.removeSource(id)
            }

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

            setLayerIds(idList)
            console.log(`${layers.length} contour layers added`)
        }
    }

    useEffect(() => {
        if (map.current) return

        console.log('Initializing map...')
        map.current = new maplibregl.Map({
            container: mapContainer.current || '',
            style: baseMapStyleUrl,
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

    return (
        <>
            <div ref={mapContainer} className={classes.map} />
        </>
    )
})
