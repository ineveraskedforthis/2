export interface point {x: number, y: number}

export class geom {
    static norm(data: point) {
        return Math.sqrt(geom.norm2(data))
    }

    static norm2(v: point) {
        return v.x*v.x + v.y*v.y
    }

    static normalize(v: point) {
        let n = geom.norm(v)
        return {x: v.x / n, y: v.y / n}
    }

    static minus(a: point, b: point) {
        return {x: a.x - b.x, y: a.y - b.y}
    }

    static dist(a: point, b: point) {
        let c = geom.minus(a, b)
        return geom.norm(c)
    }

    static mult(a: point, c: number) {
        return {x: a.x * c, y: a.y * c}
    }

    static intify(a: point) {
        return {x: Math.floor(a.x), y: Math.floor(a.y)}
    }
}


