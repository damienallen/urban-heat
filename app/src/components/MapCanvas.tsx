import '@maptiler/sdk/dist/maptiler-sdk.css'

import * as maptilersdk from '@maptiler/sdk'

import { useEffect, useRef } from 'react'

import { createUseStyles } from 'react-jss'
import { extent } from 'geojson-bounds'
import { observer } from 'mobx-react'
import { slugify } from '../utils'
import { useNavigate } from 'react-router-dom'
import { useStores } from '../stores'

const useStyles = createUseStyles({
    map: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 50,
        '& .maplibregl-ctrl-group': {
            opacity: 0.8,
        },
        '& .maplibregl-ctrl-top-right': {
            padding: '160px 8px 0 0',
        },
        '& .maplibregl-ctrl-bottom-left': {
            padding: '0 0 80px 12px',
        },
        '@media (max-width: 720px)': {
            '& .maplibregl-ctrl-top-right': {
                marginRight: -10,
                padding: '160px 0 0 0',
            },
            '& .maplibregl-ctrl-bottom-left': {
                padding: '0 0 64px 8px',
            },
        },
    },
})

export const MapCanvas = observer(() => {
    const { app, contours } = useStores()
    const classes = useStyles()
    const navigate = useNavigate()

    const mapContainer = useRef(null)
    const map = useRef(null)

    const updateStyle = () => {
        if (map.current && !contours.areProcessing) {
            const currentMap: maptilersdk.Map = map.current
            currentMap.setStyle(app.mapStyle, { diff: false })
            currentMap.on('style.load', () => {
                loadContours(contours.layers)
                loadUrbanExtents()
            })
        }
    }

    const loadUrbanExtents = () => {
        if (map.current && app.urbanExtents) {
            const currentMap: maptilersdk.Map = map.current
            const layerId = 'eu-urban-extents'

            if ([...currentMap.getLayersOrder().values()].includes(layerId)) {
                currentMap.removeLayer(`${layerId}-fill`)
                currentMap.removeLayer(`${layerId}-line`)
            }

            if (currentMap.getSource(layerId)) {
                currentMap.removeSource(layerId)
            }

            currentMap.addSource(layerId, {
                type: 'geojson',
                data: app.urbanExtents,
            })

            const maxZoom = 14
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
        if (map.current && contours.selected) {
            const currentMap: maptilersdk.Map = map.current

            // Remove existing layers and sources
            const orderedLayerIds = [...currentMap.getLayersOrder().values()]
            for (let id of orderedLayerIds) {
                if (id.includes('contour-')) {
                    currentMap.removeLayer(id)
                    currentMap.removeSource(id)
                }
            }

            // Add contour layers
            let idList = []
            let accumulatedOpacity = 0
            for (let ind = 0; ind < layers.length; ind++) {
                const layerId = `contour-${contours.selected.URAU_CODE}-${layers[ind].threshold}`
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
            console.debug(`${layers.length} contour layers added`)
        }
    }

    useEffect(() => {
        if (map.current) return

        console.log('Initializing map...')
        map.current = new maptilersdk.Map({
            container: mapContainer.current || '',
            geolocateControl: false,
            style: app.mapStyle,
            center: [4, 48],
            zoom: 5,
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
                const currentMap: maptilersdk.Map = map.current
                setTimeout(
                    () =>
                        currentMap.fitBounds(extent(app.selectedFeature), {
                            maxZoom: 12,
                            duration: 1000,
                        }),
                    500
                )
            }
        }
    }, [app.features, contours.selected])

    useEffect(() => loadUrbanExtents(), [app.urbanExtents])
    useEffect(() => updateStyle(), [app.mapStyle])

    return (
        <>
            <div ref={mapContainer} className={classes.map} />
        </>
    )
})
