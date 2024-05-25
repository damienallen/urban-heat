export const linspace = (start: number, stop: number, step: number) => {
    const num = Math.round((stop - start) / step) + 1
    return Array.from({ length: num }, (_, i) => start + step * i)
}

export const slugify = (text: string) => {
    return text
        .toString() // Convert to string
        .toLowerCase() // Convert to lowercase
        .trim() // Trim whitespace from both sides
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters
        .replace(/\-\-+/g, '-') // Replace multiple hyphens with a single hyphen
}
