import * as d3 from 'd3'

import { useEffect, useRef } from 'react'

import { fromUrl } from 'geotiff'

export const Chart = () => {
    const url = 'https://sites.dallen.dev/urban-heat/max_surface_temp_2023.tif'

    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        ;(async function () {
            console.log(`Fetching url: ${url}`)
            const tiff = await fromUrl(url)
            const image = await tiff.getImage()

            const origin = image.getOrigin()
            console.log('Origin:', origin)

            const data: number[] = (await image.readRasters())[0] as any
            const extent: number[] = d3.extent(data) as any
            const color = d3.scaleSequential(extent, d3.interpolateMagma)

            const m = image.getHeight()
            const n = image.getWidth()
            const contours = d3.contours().size([n, m]).smooth(false).thresholds([20, 30])
            const path = d3.geoPath()

            const svg = d3
                .select(ref.current)
                .append('svg')
                .attr('id', 'contour-svg')
                .attr('viewBox', `0 0 ${n} ${m}`)
                .style('width', '100%')
                .style('height', ' auto')
                .style('display', 'absolute')
                .style('top', '0')

            for (let d of contours(data)) {
                svg.append('path').attr('d', path(d)).attr('fill', color(d.value))
            }
        })()
    })

    return <div ref={ref}></div>
}
