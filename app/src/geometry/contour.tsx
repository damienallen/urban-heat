import { contours, geoTransform } from 'd3'

import { fromUrl } from 'geotiff'
import { geoProject } from 'd3-geo-projection'

const d3 = Object.assign({}, { contours, geoProject, geoTransform })

export const getContours = async (url: string, thresholds: number[]) => {
    console.log(`Fetching: ${url}`)
    const tiff = await fromUrl(url)
    const image = await tiff.getImage()

    const [oX, oY] = image.getOrigin()
    const [rX, rY] = image.getResolution()

    console.log('Parsing raster data')
    const data: number[] = (await image.readRasters())[0] as any
    const h = image.getHeight()
    const w = image.getWidth()

    console.log(`Contouring thresholds: ${thresholds}`)
    const contourGenerator = d3.contours().size([w, h]).smooth(true).thresholds(thresholds)
    const rawContours = contourGenerator(data)

    console.log('Projecting contours to WGS84')
    const projection = d3.geoTransform({
        point: function (x: number, y: number) {
            this.stream.point(oX + x * rX, oY + y * rY)
        },
    })

    let projectedContours = []
    for (let contourGeojson of rawContours) {
        let projectedGeojson = geoProject(contourGeojson, projection)
        projectedGeojson.threshold = contourGeojson.value
        projectedContours.push(projectedGeojson)
    }
    return projectedContours
}
