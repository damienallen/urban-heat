import { fromUrl } from 'geotiff'

const d3 = await Promise.all([import('d3-geo'), import('d3-geo-projection'), import('d3')]).then(
    (d3) => Object.assign({}, ...d3)
)

export const getContours = async (url: string, thresholds: number[]) => {
    console.log(`Fetching: ${url}`)
    const tiff = await fromUrl(url)
    const image = await tiff.getImage()

    const [oX, oY] = image.getOrigin()
    const [rX, rY] = image.getResolution()

    console.log('Reading raster data...')
    const data: number[] = (await image.readRasters())[0] as any
    const h = image.getHeight()
    const w = image.getWidth()

    console.log(`Contouring (${thresholds})...`)
    const contourGenerator = d3.contours().size([w, h]).smooth(true).thresholds(thresholds)

    const projection = d3.geoTransform({
        point: function (x: number, y: number) {
            this.stream.point(oX + x * rX, oY + y * rY)
        },
    })

    console.log('Projecting contours to WGS84...')
    let projectedContours = []
    const rawContours = contourGenerator(data)
    for (let contourGeojson of rawContours) {
        let projectedGeojson = d3.geoProject(contourGeojson, projection)
        projectedGeojson.threshold = contourGeojson.value
        projectedContours.push(projectedGeojson)
    }
    return projectedContours
}