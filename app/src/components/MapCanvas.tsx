import 'maplibre-gl/dist/maplibre-gl.css'

import { FeatureProperties, useStores } from '../stores'
import { useEffect, useRef, useState } from 'react'

import { createUseStyles } from 'react-jss'
import { extent } from 'geojson-bounds'
import maplibregl from 'maplibre-gl'
import { observer } from 'mobx-react'
import { slugify } from '../utils'
import { useNavigate } from 'react-router-dom'

const useStyles = createUseStyles({
    map: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 50,
        '@media (max-width: 720px)': {
            '& .maplibregl-ctrl-attrib': {
                marginBottom: '64px !important',
            },
        },
    },
})

export const MapCanvas = observer(() => {
    const { app, contours, ui } = useStores()
    const classes = useStyles()
    const navigate = useNavigate()

    const mapContainer = useRef(null)
    const map = useRef(null)

    const [contourLayerIds, setContourLayerIds] = useState<string[]>([])

    const updateStyle = () => {
        if (map.current && !contours.areProcessing) {
            const currentMap: maplibregl.Map = map.current
            currentMap.setStyle(app.styleUrl, { diff: false })
            currentMap.on('style.load', () => {
                loadContours(contours.layers)
                loadUrbanExtents()
            })
        }
    }

    const loadUrbanExtents = () => {
        if (map.current && app.urbanExtents) {
            const currentMap: maplibregl.Map = map.current
            const layerId = 'eu-urban-extents'

            if ([...currentMap.getLayersOrder().values()].includes(layerId)) {
                currentMap.removeLayer(`${layerId}-fill`)
                currentMap.removeLayer(`${layerId}-line`)
                currentMap.removeSource(layerId)
            }

            currentMap.addSource(layerId, {
                type: 'geojson',
                data: app.urbanExtents,
            })

            const maxZoom = 12
            const extentColor = '#777'

            currentMap.addLayer({
                id: `${layerId}-fill`,
                type: 'fill',
                source: layerId,
                layout: {},
                paint: {
                    'fill-color': extentColor,
                    'fill-opacity': 0.2,
                },
                maxzoom: maxZoom,
            })

            currentMap.addLayer({
                id: `${layerId}-line`,
                type: 'line',
                source: layerId,
                layout: {},
                paint: {
                    'line-width': 1.5,
                    'line-color': extentColor,
                    'line-opacity': 0.3,
                },
                maxzoom: maxZoom,
            })

            // Load contours and center map on click
            currentMap.on('click', `${layerId}-fill`, (e) => {
                const feature = e.features![0]
                if (!contours.areProcessing) {
                    const city = slugify(feature.properties.URAU_NAME)
                    console.debug(`Selected URAU: ${feature.properties.URAU_CODE} (${city})`)
                    contours.setSelected(feature.properties as FeatureProperties)
                    navigate(`/${city}`)
                }
            })

            currentMap.on('mouseenter', `${layerId}-fill`, () => {
                currentMap.getCanvas().style.cursor = 'pointer'
            })

            // Change the cursor back to default when it leaves the vector layer
            currentMap.on('mouseleave', `${layerId}-fill`, () => {
                currentMap.getCanvas().style.cursor = ''
            })
        }
    }

    const loadContours = (layers: any[]) => {
        if (map.current) {
            const currentMap: maplibregl.Map = map.current

            // Remove existing layers and sources
            const orderedLayerIds = [...currentMap.getLayersOrder().values()]
            console.debug(`Removing ${orderedLayerIds.length} existing layers`)
            for (let id of contourLayerIds) {
                if (orderedLayerIds.includes(id)) {
                    currentMap.removeLayer(id)
                    currentMap.removeSource(id)
                }
            }

            // Add contour layers
            let idList = []
            let accumulatedOpacity = 0
            for (let ind = 0; ind < layers.length; ind++) {
                const layerId = `contour-${layers[ind].threshold}`
                idList.push(layerId)

                const opacity = (ind + 1) / (layers.length + 1) - accumulatedOpacity
                accumulatedOpacity += opacity

                currentMap.addSource(layerId, {
                    type: 'geojson',
                    data: layers[ind],
                })
                currentMap.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: layerId,
                    layout: {},
                    paint: {
                        'fill-color': '#f00',
                        'fill-opacity': opacity,
                    },
                    minzoom: 8,
                })
            }

            setContourLayerIds(idList)
            ui.setMapLoaded(true)
            console.debug(`${layers.length} contour layers added`)
        }
    }

    useEffect(() => {
        if (map.current) return

        console.log('Initializing map...')
        map.current = new maplibregl.Map({
            container: mapContainer.current || '',
            style: app.styleUrl,
            center: [6, 48],
            zoom: 4.5,
        }) as any
        ;(map.current as any).on('load', () => {
            console.log('Map loaded successfully')
            app.fetchUrbanExtents()
        })
    }, [])

    useEffect(() => {
        if (!contours.areProcessing) {
            loadContours(contours.layers)
        }
    }, [contours.layers])

    useEffect(() => {
        if (app.features) {
            if (map.current && app.selectedFeature) {
                const currentMap: maplibregl.Map = map.current
                setTimeout(
                    () =>
                        currentMap.fitBounds(extent(app.selectedFeature), {
                            padding: 200,
                            maxZoom: 12,
                            duration: 1000,
                        }),
                    500
                )
            }
        }
    }, [app.features, contours.selected])

    useEffect(() => loadUrbanExtents(), [app.urbanExtents])
    useEffect(() => updateStyle(), [app.styleUrl])

    return (
        <>
            <div ref={mapContainer} className={classes.map} />
        </>
    )
})
