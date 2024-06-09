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

const buildingsSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#555555" viewBox="0 0 256 256">
    <path d="M136,32V216H40V85.35a8,8,0,0,1,3.56-6.66l80-53.33A8,8,0,0,1,136,32Z" opacity="0.2"></path>
    <path d="M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z"></path>
</svg>
`

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
                loadIcons()
            })
        }
    }

    const setPointerEvents = (layerId: string) => {
        if (map.current && app.urbanExtents) {
            const currentMap: maptilersdk.Map = map.current
            currentMap.on('mouseenter', layerId, () => {
                currentMap.getCanvas().style.cursor = 'pointer'
            })

            currentMap.on('mouseleave', layerId, () => {
                currentMap.getCanvas().style.cursor = ''
            })

            currentMap.on('click', layerId, (e) => {
                const feature = e.features![0]
                if (!contours.areProcessing) {
                    const city = slugify(feature.properties.URAU_NAME)
                    console.debug(`Selected URAU: ${feature.properties.URAU_CODE} (${city})`)
                    navigate(`/${city}`)
                }
            })
        }
    }

    const loadUrbanExtents = () => {
        if (map.current && app.urbanExtents) {
            const currentMap: maptilersdk.Map = map.current
            const layerId = 'eu-urban-extents'

            const extentColor = '#777'
            const minZoom = 6
            const maxZoom = 14

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
                minzoom: minZoom,
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
                minzoom: minZoom,
            })

            // Load contours and center map on click
            setPointerEvents(`${layerId}-fill`)
        }
    }

    const loadIcons = () => {
        if (map.current && app.centroidsGeojson) {
            const currentMap: maptilersdk.Map = map.current
            const layerId = 'centroids'

            if (!currentMap.getSource(layerId)) {
                const svgImage = new Image(32, 32)
                svgImage.onload = () => {
                    currentMap.addImage('hoverIcon', svgImage)
                }

                svgImage.src =
                    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(buildingsSVG)

                currentMap.addSource(layerId, {
                    type: 'geojson',
                    data: app.centroidsGeojson,
                })

                currentMap.addLayer({
                    id: layerId,
                    type: 'symbol',
                    source: layerId,
                    layout: {
                        'icon-image': 'hoverIcon',
                    },
                    paint: {},
                    maxzoom: 9,
                })

                setPointerEvents(layerId)
            }
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
                    type: app.mapStyle === 'topo-v2' ? 'fill-extrusion' : 'fill',
                    source: layerId,
                    layout: {},
                    paint:
                        app.mapStyle === 'topo-v2'
                            ? ({
                                  'fill-extrusion-color': '#f00',
                                  'fill-extrusion-opacity': opacity,
                                  'fill-extrusion-height': 10 * (ind + 1),
                              } as any)
                            : {
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
            loadIcons()
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
