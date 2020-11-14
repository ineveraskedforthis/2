
function norm(data) {
    return Math.sqrt(norm2(data))
}

function norm2(v) {
    return v.x*v.x + v.y*v.y
}

function normalize(v) {
    let n = norm(v)
    return {x: v.x / n, y: v.y / n}
}

function minus(a, b) {
    return {x: a.x - b.x, y: a.y - b.y}
}

function dist(a, b) {
    let c = minus(a, b)
    return norm(c)
}

function mult(a, c) {
    return {x: a.x * c, y: a.y * c}
}

module.exports = {
    norm: norm,
    norm2: norm2,
    normalize: normalize,
    dist: dist,
    minus: minus,
    mult: mult
}