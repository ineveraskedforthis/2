"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.select_max = exports.select_weighted = exports.trim = void 0;
function trim(value, left, right) {
    return Math.max(Math.min(value, right), left);
}
exports.trim = trim;
function select_weighted(input, constraints) {
    let total = 0;
    for (let item of input) {
        if (constraints != undefined) {
            if (!constraints(item.item))
                continue;
        }
        total += item.weight;
    }
    let dice = Math.random() * total;
    let current = 0;
    for (let item of input) {
        if (constraints != undefined) {
            if (!constraints(item.item))
                continue;
        }
        current += item.weight;
        if (current > dice)
            return item.item;
    }
    return input[0].item;
}
exports.select_weighted = select_weighted;
function select_max(input, constraints) {
    let max = 0;
    let result = undefined;
    for (let item of input) {
        if (constraints != undefined) {
            if (!constraints(item.item))
                continue;
        }
        if ((result == undefined) || (max < item.weight)) {
            max = item.weight;
            result = item.item;
        }
    }
    return result;
}
exports.select_max = select_max;
