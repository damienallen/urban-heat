/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope

import { getContours } from './contour'

export const startContouring = (url: string, thresholds: number[]) => {
    return getContours(url, thresholds)
}
