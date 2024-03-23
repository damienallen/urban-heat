export const contourWorker = new ComlinkWorker<typeof import('./contour.worker.ts')>(
    new URL('./contour.worker.ts', import.meta.url)
)
