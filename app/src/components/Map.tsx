import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef } from 'react'

import maplibregl from 'maplibre-gl'

const API_KEY = 'bk2NyBkmsa6NdxDbxXvH'

export const Map = () => {
    const mapContainer = useRef(null)
    const map = useRef<null | maplibregl.Map>(null)

    useEffect(() => {
        if (map.current) return // stops map from intializing more than once

        map.current = new maplibregl.Map({
            container: mapContainer.current || '',
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
            center: [4.478, 51.924],
            zoom: 10,
        })

        // map.once('load', () => {
        //     // This code runs once the base style has finished loading.
        // })
    })

    return (
        <>
            <div ref={mapContainer} className="base-map" />
        </>
    )
}
