import { fromUrl } from 'geotiff'

const d3 = await Promise.all([import('d3-geo'), import('d3-geo-projection'), import('d3')]).then(
    (d3) => Object.assign({}, ...d3)
)

export const getContours = async (url: string) => {
    console.log(`Fetching url: ${url}`)
    const tiff = await fromUrl(url)
    const image = await tiff.getImage()

    const [oX, oY] = image.getOrigin()
    const [rX, rY] = image.getResolution()

    const data: number[] = (await image.readRasters())[0] as any
    const h = image.getHeight()
    const w = image.getWidth()

    const contourGenerator = d3.contours().size([w, h]).smooth(true).thresholds([20, 25, 30, 35])

    const projection = d3.geoTransform({
        point: function (x: number, y: number) {
            this.stream.point(oX + x * rX, oY + y * rY)
        },
    })

    let projectedContours = []
    const rawContours = contourGenerator(data)
    for (let contourGeojson of rawContours) {
        let projectedGeojson = d3.geoProject(contourGeojson, projection)
        projectedGeojson.threshold = contourGeojson.value
        projectedContours.push(projectedGeojson)
    }
    return projectedContours
}
