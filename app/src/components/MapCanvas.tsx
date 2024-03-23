import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef } from 'react'

import { contourWorker } from '../geometry/workers'
import maplibregl from 'maplibre-gl'

const dataUrl = 'https://sites.dallen.dev/urban-heat/max_surface_temp_2023.tif'

const mapStyleId = 'basic-v2' // basic-v2 | bright-v2 | dataviz | satellite | streets-v2 | topo-v2
const API_KEY = 'bk2NyBkmsa6NdxDbxXvH'
const baseMapStyleUrl = `https://api.maptiler.com/maps/${mapStyleId}/style.json?key=${API_KEY}`

const linspace = (start: number, stop: number, step: number) => {
    const num = Math.round((stop - start) / step) + 1
    return Array.from({ length: num }, (_, i) => start + step * i)
}

export const MapCanvas = () => {
    const mapContainer = useRef(null)

    useEffect(() => {
        console.log('Initializing map...')

        const map = new maplibregl.Map({
            container: mapContainer.current || '',
            style: baseMapStyleUrl,
            center: [4.478, 51.924],
            zoom: 10,
        })

        const loadContours = async () => {
            console.log('Contouring max surface temperature raster')
            const contourThresholds = linspace(36, 42, 2)
            const contours = await contourWorker.startContouring(dataUrl, contourThresholds)

            console.log(`Adding ${contours.length} contour layers to map`)
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
        }

        map.on('load', () => {
            console.log('Map loaded.')
            loadContours()
        })
    })

    return (
        <>
            <div ref={mapContainer} className="base-map" />
        </>
    )
}
