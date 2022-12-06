export function trim(value: number, left: number, right: number) {
    return Math.max(Math.min(value, right), left)
}