import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef } from 'react'

import { getContours } from './Contours'
import maplibregl from 'maplibre-gl'

const dataUrl = 'https://sites.dallen.dev/urban-heat/wgs84/max_surface_temp_2023.tif'
const API_KEY = 'bk2NyBkmsa6NdxDbxXvH'

export const MapCanvas = () => {
    const mapContainer = useRef(null)
    const contourContainer = useRef<HTMLInputElement>(null)

    useEffect(() => {
        console.log('Initializing map...')

        const map = new maplibregl.Map({
            container: mapContainer.current || '',
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
            center: [4.478, 51.924],
            zoom: 10,
        })

        const loadContours = async () => {
            console.log('Contouring max surface temperature raster')
            const contours = await getContours(dataUrl)

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
                        'fill-color': '#088',
                        'fill-opacity': 0.8,
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
