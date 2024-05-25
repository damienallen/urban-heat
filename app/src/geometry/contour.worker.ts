import { contours, geoTransform } from 'd3'

import { fromUrl } from 'geotiff'
import { geoProject } from 'd3-geo-projection'

const d3 = Object.assign({}, { contours, geoProject, geoTransform })

onmessage = async (e: MessageEvent) => {
    console.log(`Fetching: ${e.data.url}`)
    postMessage({ type: 'progress', state: 'Fetching images', progress: 20 })
    const tiff = await fromUrl(e.data.url)

    const image = await tiff.getImage()
    const [oX, oY] = image.getOrigin()
    const [rX, rY] = image.getResolution()

    console.log('Parsing raster data')
    postMessage({ type: 'progress', state: 'Loading images', progress: 30 })
    const data: number[] = (await image.readRasters())[0] as any
    const h = image.getHeight()
    const w = image.getWidth()

    console.log(`Contouring thresholds: ${e.data.thresholds}`)
    postMessage({ type: 'progress', state: 'Contouring', progress: 50 })
    const contourGenerator = d3.contours().size([w, h]).smooth(true).thresholds(e.data.thresholds)
    const rawContours = contourGenerator(data)

    console.log('Projecting contours to WGS84')
    postMessage({ type: 'progress', state: 'Projecting', progress: 80 })
    const projection = d3.geoTransform({
        point: function (x: number, y: number) {
            this.stream.point(oX + x * rX, oY + y * rY)
        },
    })

    let projectedContours = []
    for (let contourGeojson of rawContours) {
        if (contourGeojson.coordinates.length) {
            let projectedGeojson = geoProject(contourGeojson, projection)
            projectedGeojson.threshold = contourGeojson.value
            projectedContours.push(projectedGeojson)
        }
    }

    postMessage({ type: 'result', result: projectedContours })
}
