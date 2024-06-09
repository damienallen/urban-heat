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
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#333333" viewBox="0 0 256 256">
    <path d="M136,32V216H40V85.35a8,8,0,0,1,3.56-6.66l80-53.33A8,8,0,0,1,136,32Z" opacity="0.2"></path>
    <path d="M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z"></path>
</svg>
`

const tapSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#333333" viewBox="0 0 256 256">
    <path d="M56,76a60,60,0,0,1,120,0,8,8,0,0,1-16,0,44,44,0,0,0-88,0,8,8,0,1,1-16,0Zm140,44a27.9,27.9,0,0,0-13.36,3.39A28,28,0,0,0,144,106.7V76a28,28,0,0,0-56,0v80l-3.82-6.13a28,28,0,0,0-48.41,28.17l29.32,50A8,8,0,1,0,78.89,220L49.6,170a12,12,0,1,1,20.78-12l.14.23,18.68,30A8,8,0,0,0,104,184V76a12,12,0,0,1,24,0v68a8,8,0,1,0,16,0V132a12,12,0,0,1,24,0v20a8,8,0,0,0,16,0v-4a12,12,0,0,1,24,0v36c0,21.61-7.1,36.3-7.16,36.42a8,8,0,0,0,3.58,10.73A7.9,7.9,0,0,0,208,232a8,8,0,0,0,7.16-4.42c.37-.73,8.85-18,8.85-43.58V148A28,28,0,0,0,196,120Z"></path>
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

    const setSelectOnClick = (layerId: string) => {
        if (map.current && app.urbanExtents) {
            const currentMap: maptilersdk.Map = map.current
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
                    'fill-color': '#777',
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
                    'line-color': '#777',
                    'line-opacity': 0.3,
                },
                maxzoom: maxZoom,
                minzoom: minZoom,
            })

            // Load contours and center map on click
            currentMap.on('mouseenter', `${layerId}-fill`, () => {
                currentMap.getCanvas().style.cursor = 'pointer'
            })

            currentMap.on('mouseleave', `${layerId}-fill`, () => {
                currentMap.getCanvas().style.cursor = ''
            })

            setSelectOnClick(`${layerId}-fill`)
        }
    }

    const loadIcons = () => {
        if (map.current && app.centroidsGeojson) {
            const currentMap: maptilersdk.Map = map.current
            const sourceId = 'centroids'
            const iconSize = 0.4

            if (!currentMap.getSource(sourceId)) {
                const buildingsImage = new Image(64, 64)
                buildingsImage.onload = () => {
                    currentMap.addImage('buildingsIcon', buildingsImage)
                }
                buildingsImage.src =
                    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(buildingsSVG)

                const tapImage = new Image(64, 64)
                tapImage.onload = () => {
                    currentMap.addImage('tapIcon', tapImage)
                }
                tapImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tapSVG)

                currentMap.addSource(sourceId, {
                    type: 'geojson',
                    data: app.centroidsGeojson,
                })

                currentMap.addLayer({
                    id: `${sourceId}-building`,
                    type: 'symbol',
                    source: sourceId,
                    filter: ['all', ['!=', 'URAU_CODE', contours.selected?.URAU_CODE || '']],
                    layout: {
                        'icon-image': 'buildingsIcon',
                        'icon-size': iconSize,
                    },
                    paint: {},
                    maxzoom: 9,
                })

                currentMap.addLayer({
                    id: `${sourceId}-tap`,
                    type: 'symbol',
                    source: sourceId,
                    filter: ['all', ['!=', 'URAU_CODE', contours.selected?.URAU_CODE || '']],
                    layout: {
                        'icon-image': 'tapIcon',
                        'icon-size': iconSize,
                    },
                    paint: {},
                    minzoom: 9,
                })

                setSelectOnClick(`${sourceId}-building`)
                setSelectOnClick(`${sourceId}-tap`)
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
                    minzoom: 6,
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
                if (
                    currentMap.getLayer('centroids-building') &&
                    currentMap.getLayer('centroids-tap')
                ) {
                    currentMap.setFilter('centroids-building', [
                        'all',
                        ['!=', 'URAU_CODE', contours.selected?.URAU_CODE || ''],
                    ])
                    currentMap.setFilter('centroids-tap', [
                        'all',
                        ['!=', 'URAU_CODE', contours.selected?.URAU_CODE || ''],
                    ])
                }

                setTimeout(() => {
                    currentMap.fitBounds(extent(app.selectedFeature), {
                        maxZoom: 12,
                        duration: 1000,
                    })
                }, 200)
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
