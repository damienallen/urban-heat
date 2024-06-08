import { useEffect, useState } from 'react'
import { slugify } from '../utils'

const fetchExtents = async () => {
    const response = await fetch('urban_extents.geojson')
    const extents = await response.json()
    return extents
}

export const SiteMap = () => {
    const [features, setFeatures] = useState<string[]>([])

    useEffect(() => {
        fetchExtents().then((urauGeojson: any) => {
            setFeatures(
                urauGeojson.features
                    .map((f: any) => slugify(f.properties.URAU_NAME))
                    .sort()
                    .map((name: string) => <div>{`${window.location.origin}/${name}`}</div>)
            )
        })
    }, [])

    return <div>{features}</div>
}
