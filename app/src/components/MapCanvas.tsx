import 'maplibre-gl/dist/maplibre-gl.css'

import { FeatureProperties, useStores } from '../stores'
import { useEffect, useRef, useState } from 'react'

import { createUseStyles } from 'react-jss'
import maplibregl from 'maplibre-gl'
import { observer } from 'mobx-react'

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
                    console.debug(`Selected URAU: ${feature.properties.URAU_CODE}`)
                    contours.setSelected(feature.properties as FeatureProperties)
                }

                if (e.lngLat) {
                    const coordinates = (feature.geometry as any).coordinates[0]
                    const bounds = coordinates.reduce((bounds: any, coord: any) => {
                        return bounds.extend(coord)
                    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))

                    currentMap.fitBounds(bounds, {
                        padding: 200,
                        maxZoom: 12,
                        duration: 1200,
                    })
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
            ui.setLoadingState('', 100)
            console.debug(`${layers.length} contour layers added`)
        }
    }

    useEffect(() => {
        if (map.current) return

        console.log('Initializing map...')
        map.current = new maplibregl.Map({
            container: mapContainer.current || '',
            style: app.styleUrl,
            center: app.mapCenter,
            zoom: 10,
        }) as any
        ;(map.current as any).on('load', () => {
            console.log('Map loaded successfully')
            app.fetchUrbanExtents()
            contours.setInitialUrau()
        })
    }, [])

    useEffect(() => {
        if (!contours.areProcessing) {
            loadContours(contours.layers)
        }
    }, [contours.layers])

    useEffect(() => {
        if (map.current && app.bounds) {
            const currentMap: maplibregl.Map = map.current
            currentMap.fitBounds(app.bounds, { padding: 20, maxZoom: 14 })
        }
    }, [app.bounds])

    useEffect(() => loadUrbanExtents(), [app.urbanExtents])
    useEffect(() => updateStyle(), [app.styleUrl])

    return (
        <>
            <div ref={mapContainer} className={classes.map} />
        </>
    )
})
