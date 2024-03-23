/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope

import { getContours } from './Contours'

export const startContouring = (url: string, thresholds: number[]) => {
    return getContours(url, thresholds)
}
