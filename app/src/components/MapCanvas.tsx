import 'maplibre-gl/dist/maplibre-gl.css'

import { useEffect, useRef, useState } from 'react'

import { contourWorker } from '../geometry/workers'
import { createUseStyles } from 'react-jss'
import maplibregl from 'maplibre-gl'
import { observer } from 'mobx-react'
import { useStores } from '../stores'

const mapStyleId = 'dataviz' // basic-v2 | bright-v2 | dataviz | satellite | streets-v2 | topo-v2

const API_KEY = 'bk2NyBkmsa6NdxDbxXvH' // TODO: reset and protect origins for key
const baseMapStyleUrl = `https://api.maptiler.com/maps/${mapStyleId}/style.json?key=${API_KEY}`

const useStyles = createUseStyles({
    map: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 100,
    },
})

export const MapCanvas = observer(() => {
    const { app } = useStores()
    const classes = useStyles()

    const map = useRef<maplibregl.Map>(null)
    const [renderedYear, setRenderedYear] = useState<number>(app.selectedYear)

    const dataUrl = `https://sites.dallen.dev/urban-heat/zh/max_surface_temp_${app.selectedYear}.tif`

    const loadContours = async () => {
        setRenderedYear(app.selectedYear)
        app.setIsContouring(true)
        const contours = await contourWorker.startContouring(dataUrl, app.contourThresholds)

        for (let contourGeojson of contours) {
            const layerId = `contour-${contourGeojson.threshold}`

            ;(map.current as maplibregl.Map).addSource(layerId, {
                type: 'geojson',
                data: contourGeojson,
            })
            ;(map.current as maplibregl.Map).addLayer({
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
        console.log(`${contours.length} contour layers added`)
    }

    useEffect(() => {
        console.log('Initializing map...')
        if (map.current) return

        map.current = new maplibregl.Map({
            container: map.current || '',
            style: baseMapStyleUrl,
            center: [4.478, 51.924],
            zoom: 10,
        })

        map.current.on('load', () => {
            console.log('Map loaded successfully')
            loadContours()
        })
    }, [])

    useEffect(() => {
        if (renderedYear !== app.selectedYear) {
            console.log('RELOADING')
            loadContours()
        }
    }, [app.selectedYear])

    return (
        <>
            <div ref={map} className={classes.map} />
        </>
    )
})
