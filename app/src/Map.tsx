import 'maplibre-gl/dist/maplibre-gl.css'
import './Map.css'

import { Pool, fromUrl } from 'geotiff'
import { useEffect, useRef } from 'react'

import maplibregl from 'maplibre-gl'

// import * as d3 from 'd3'

const d3 = await Promise.all([
    import('d3-format'),
    import('d3-geo'),
    import('d3-geo-projection'),
    import('d3'),
]).then((d3) => Object.assign({}, ...d3))
const API_KEY = 'bk2NyBkmsa6NdxDbxXvH'
// const url = 'https://sites.dallen.dev/urban-heat/max_surface_temp_2023.tif'
const url = 'https://sites.dallen.dev/urban-heat/max_surface_temp_epsg3395.tif'
// const url = 'https://sites.dallen.dev/urban-heat/max_surface_temp.tif'

export const Map = () => {
    const mapContainer = useRef(null)
    const map = useRef<null | maplibregl.Map>(null)

    const runContouring = async () => {
        console.log(`Fetching url: ${url}`)
        const tiff = await fromUrl(url)
        const image = await tiff.getImage()

        const h = image.getHeight()
        const w = image.getWidth()

        const origin = image.getOrigin()
        const resolution = image.getResolution()
        const bbox = image.getBoundingBox()
        console.log('w', w)
        console.log('h', h)
        console.log('origin', origin)
        console.log('resolution', resolution)
        console.log('bbox', bbox)

        // debugger

        const invert = (d: any) => {
            const shared: any = {}
            let p = {
                type: 'Polygon',
                coordinates: d3.merge(
                    d.coordinates.map((poly: any) => {
                        return poly.map((ring: any) => {
                            return ring
                                .map((point: any) => {
                                    return [(point[0] / w) * 360 - 180, 90 - (point[1] / h) * 180]
                                })
                                .reverse()
                        })
                    })
                ),
            }

            // Record the y-intersections with the antimeridian.
            p.coordinates.forEach((ring: any) => {
                ring.forEach((p: any) => {
                    if (p[0] === -180) shared[p[1]] |= 1
                    else if (p[0] === 180) shared[p[1]] |= 2
                })
            })

            // Offset any unshared antimeridian points to prevent their stitching.
            p.coordinates.forEach((ring: any) => {
                ring.forEach((p: any) => {
                    if ((p[0] === -180 || p[0] === 180) && shared[p[1]] !== 3) {
                        p[0] = p[0] === -180 ? -179.9995 : 179.9995
                    }
                })
            })

            p = d3.geoStitch(p)

            console.log(d, p)

            // If the MultiPolygon is empty, treat it as the Sphere.
            return p.coordinates.length
                ? { type: 'Polygon', coordinates: p.coordinates }
                : { type: 'Sphere' }
        }

        const rotate = (values: any) => {
            let l = w >> 1
            for (let j = 0, k = 0; j < h; ++j, k += w) {
                values.subarray(k, k + l).reverse()
                values.subarray(k + l, k + w).reverse()
                values.subarray(k, k + w).reverse()
            }
            return values
        }

        console.log('Rotating verticies...')
        const pool = new Pool()
        // const data: any = (await image.readRasters())[0]
        const data = rotate((await image.readRasters({ pool }))[0])

        console.log('Contouring...')
        const contours = d3.contours().size([w, h]).smooth(false).thresholds([20, 30])
        const color = d3.scaleSequential(d3.extent(data), d3.interpolateMagma)

        //Project any point to map's current state
        function projectPoint(lon: number, lat: number) {
            console.log(lon, lat)
            debugger
            let point = map.current.project(new maplibregl.LngLat(lon, lat))
            // console.log(lon, lat, '>', point.x, point.y)
            this.stream.point(point.x, point.y)
        }
        let transform = d3.geoTransform({ point: projectPoint })
        const path = d3.geoPath().projection(transform)

        // const path = d3.geoPath()

        // const isolines = Array.from(contours(data as any))

        const contourList = contours(data)
        console.log('Converting path to svg...')

        // const tiffBbox = {
        //     type: 'Polygon',
        //     coordinates: [
        //         [
        //             [bbox[0], bbox[1]],
        //             [bbox[2], bbox[1]],
        //             [bbox[2], bbox[3]],
        //             [bbox[0], bbox[3]],
        //             [bbox[0], bbox[1]],
        //         ],
        //     ],
        // }

        // const path = d3.geoPath(
        //     d3.geoTransverseMercator().rotate([-3.0, 0]).fitExtent([w, h], tiffBbox)
        // )

        const svg = d3
            .select(mapContainer.current)
            .append('svg')
            .attr('id', 'contour-svg')
            .attr('viewBox', `0 0 ${w} ${h}`)
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0)
            .style('width', '100%')
            .style('height', ' auto')
            .style('pointer-events', 'none')

        for (let d of contourList) {
            const contourPath = invert(d)
            // console.log('contourPath', contourPath)
            console.log('contourPath', d, path(d))
            svg.append('path')
                // .attr('d', path(d))
                .attr('d', path(contourPath))
                .attr('fill', color(d.value))
        }
        console.log('Done!')
    }

    useEffect(() => {
        if (map.current) return // stops map from intializing more than once

        map.current = new maplibregl.Map({
            container: mapContainer.current || '',
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
            center: [4.478, 51.924],
            zoom: 10,
        })

        // runContouring()
    })

    return (
        <>
            <div ref={mapContainer} className="map" />
        </>
    )
}
