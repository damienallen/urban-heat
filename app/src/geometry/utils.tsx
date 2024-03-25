export const linspace = (start: number, stop: number, step: number) => {
    const num = Math.round((stop - start) / step) + 1
    return Array.from({ length: num }, (_, i) => start + step * i)
}
