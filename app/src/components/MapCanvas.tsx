import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef } from 'react'

import maplibregl from 'maplibre-gl'

const dataUrl = 'https://sites.dallen.dev/urban-heat/max_surface_temp_2023.tif'

const API_KEY = 'bk2NyBkmsa6NdxDbxXvH'
// const baseMapStyleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`
// const baseMapStyleUrl = `https://api.maptiler.com/maps/satellite/style.json?key=${API_KEY}`
const baseMapStyleUrl = `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`
// const baseMapStyleUrl = `https://api.maptiler.com/maps/dataviz/style.json?key=${API_KEY}`
// const baseMapStyleUrl = `https://api.maptiler.com/maps/bright-v2/style.json?key=${API_KEY}`
// const baseMapStyleUrl = `https://api.maptiler.com/maps/topo-v2/style.json?key=${API_KEY}`

const linspace = (start: number, stop: number, step: number) => {
    const num = Math.round((stop - start) / step) + 1
    return Array.from({ length: num }, (_, i) => start + step * i)
}

// worker instance
export const contourWorker = new ComlinkWorker<typeof import('../geometry/worker')>(
    new URL('../geometry/worker', import.meta.url)
)

export const MapCanvas = () => {
    const mapContainer = useRef(null)
    const contourContainer = useRef<HTMLInputElement>(null)

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
            // const contours = await getContours(dataUrl, contourThresholds)
            const contours = await contourWorker.startContouring(dataUrl, contourThresholds)

            console.log(`Adding ${contours.length} contour layers to map`)
            for (let contourGeojson of contours) {
                console.log(contourGeojson)
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
            <div ref={contourContainer}></div>
            <div ref={mapContainer} className="base-map" />
        </>
    )
}
