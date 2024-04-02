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

    const [renderedYear, setRenderedYear] = useState<number>(app.selectedYear)
    const [layerIds, setLayerIds] = useState<string[]>([])

    const dataUrl = `https://sites.dallen.dev/urban-heat/zh/max_surface_temp_${app.selectedYear}.tif`

    // TODO: reset and protect origins for key
    const baseMapStyleUrl = `https://api.maptiler.com/maps/${app.baseMapId}/style.json?key=bk2NyBkmsa6NdxDbxXvH`

    const loadContours = async (thresholds: number[]) => {
        if (map.current) {
            const currentMap: maplibregl.Map = map.current
            setRenderedYear(app.selectedYear)
            contours.setIsProcessing(true)

            // Remove existing layers and sources
            for (let id of layerIds) {
                currentMap.removeLayer(id)
                currentMap.removeSource(id)
            }

            let idList = []
            const contoursList = await contourWorker.startContouring(dataUrl, thresholds)

            for (let contourGeojson of contoursList) {
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
            contours.setIsProcessing(false)
            console.log(`${contoursList.length} contour layers added`)
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
            loadContours(contours.thresholds)
        })
    }, [])

    useEffect(() => {
        if (!contours.isProcessing) {
            loadContours(contours.thresholds)
        }
    }, [contours.thresholds])

    useEffect(() => {
        if (renderedYear !== app.selectedYear && !contours.isProcessing) {
            loadContours(contours.thresholds)
        }
    }, [app.selectedYear])

    return (
        <>
            <div ref={mapContainer} className={classes.map} />
        </>
    )
})
