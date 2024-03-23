import { fromUrl } from 'geotiff'
import getExtent from '@mapbox/geojson-extent'

const d3 = await Promise.all([
    import('d3-format'),
    import('d3-geo'),
    import('d3-geo-projection'),
    import('d3'),
]).then((d3) => Object.assign({}, ...d3))

export const getContours = async (url: string) => {
    console.log(`Fetching url: ${url}`)
    const tiff = await fromUrl(url)
    const image = await tiff.getImage()
    const origin = image.getOrigin()
    console.log('origin', origin)

    const data: number[] = (await image.readRasters())[0] as any
    const extent = image.getBoundingBox()
    const h = image.getHeight()
    const w = image.getWidth()
    console.log(h, 'x', w)

    const contourGenerator = d3.contours().size([w, h]).smooth(false).thresholds([20, 30])
    const rawContours = contourGenerator(data)
    console.log('raw: ', rawContours)

    let projectedContours = []
    console.log('left', extent[0], 'top', extent[3], 'right', extent[2], 'bottom', extent[1])

    for (let contourGeojson of rawContours) {
        console.log('ext raw:', getExtent(contourGeojson))
        const extentCoordinates = [
            [
                [0, 0],
                [0, h],
                [w, h],
                [w, 0],
                [0, 0],
            ],
        ]

        const extendedGeojson =
            contourGeojson.type == 'MultiPolygon'
                ? {
                      type: 'MultiPolygon',
                      threshold: contourGeojson.value,
                      //   coordinates: [extentCoordinates],
                      coordinates: [...contourGeojson.coordinates, extentCoordinates],
                  }
                : {
                      type: 'MultiPolygon',
                      threshold: contourGeojson.value,
                      //   coordinates: [extentCoordinates],
                      coordinates: [contourGeojson.coordinates, extentCoordinates],
                  }

        // const extendedGeojson = contourGeojson

        const d3Extent = [
            [extent[0], extent[3]],
            [extent[2], extent[1]],
        ]

        console.log('ext ext:', getExtent(extendedGeojson))

        console.log('ext d3:', d3Extent)
        const projection = d3.geoIdentity().fitExtent(d3Extent, extendedGeojson)

        let projectedGeojson = d3.geoProject(extendedGeojson, projection)
        projectedGeojson.threshold = extendedGeojson.threshold
        projectedContours.push(projectedGeojson)
        console.log('ext proj:', getExtent(projectedGeojson))
    }
    return projectedContours
}
