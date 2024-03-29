import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef } from 'react'

import { contourWorker } from '../geometry/workers'
import { createUseStyles } from 'react-jss'
import { linspace } from '../geometry/utils'
import maplibregl from 'maplibre-gl'
import { useStores } from '../stores'

const mapStyleId = 'dataviz' // basic-v2 | bright-v2 | dataviz | satellite | streets-v2 | topo-v2

const API_KEY = 'bk2NyBkmsa6NdxDbxXvH' // TODO: reset and protect origins for key
const baseMapStyleUrl = `https://api.maptiler.com/maps/${mapStyleId}/style.json?key=${API_KEY}`

const dataUrl = 'https://sites.dallen.dev/urban-heat/zh/max_surface_temp_2023.tif'

const useStyles = createUseStyles({
    map: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 100,
    },
})

export const MapCanvas = () => {
    const mapContainer = useRef(null)

    const { app } = useStores()
    const classes = useStyles()

    useEffect(() => {
        console.log('Initializing map...')

        const map = new maplibregl.Map({
            container: mapContainer.current || '',
            style: baseMapStyleUrl,
            center: [4.478, 51.924],
            zoom: 10,
        })

        const loadContours = async () => {
            const contourThresholds = linspace(44, 48, 2)
            const contours = await contourWorker.startContouring(dataUrl, contourThresholds)

            for (let contourGeojson of contours) {
                const layerId = `contour-${contourGeojson.threshold}`
                map.addSource(layerId, { type: 'geojson', data: contourGeojson })
                map.addLayer({
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

            app.setIsContouring(false)
        }

        map.on('load', () => {
            console.log('Map loaded.')
            app.setIsContouring(true)
            loadContours()
        })
    }, [])

    return (
        <>
            <div ref={mapContainer} className={classes.map} />
        </>
    )
}
