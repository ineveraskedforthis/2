export function trim(value: number, left: number, right: number) {
    return Math.max(Math.min(value, right), left)
}

export function select_weighted<T>(input: {item: T, weight: number}[], constraints?: (cell: T) => boolean): T {
    let total = 0
    for (let item of input) {
        if (constraints != undefined) {
            if (!constraints(item.item)) continue
        }
        total += item.weight
    }
    let dice = Math.random() * total

    let current = 0
    for (let item of input) {
        if (constraints != undefined) {
            if (!constraints(item.item)) continue
        }
        current += item.weight
        if (current > dice) return item.item
    }

    return input[0].item
}

export function select_max<T>(input: {item: T, weight: number}[], constraints?: (cell: T) => boolean): T {
    let max = 0
    let result = input[1].item

    for (let item of input) {
        if (constraints != undefined) {
            if (!constraints(item.item)) continue
        }

        if ((result == undefined) || (max < item.weight)) {
            max = item.weight
            result = item.item
        }
    }

    return result
}