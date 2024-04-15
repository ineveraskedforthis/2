export interface point {x: number, y: number}

export class geom {
    static norm(data: point) {
        return Math.sqrt(geom.norm2(data))
    }

    static norm2(v: point) {
        return v.x*v.x + v.y*v.y
    }

    static normalize<T extends point>(v: T): T {
        let n = geom.norm(v)
        return {x: v.x / n, y: v.y / n} as T
    }

    /**
     * a minus b
     * @param a
     * @param b
     * @returns
     */
    static minus<T extends point>(a: T, b: T): T {
        return {x: a.x - b.x, y: a.y - b.y} as T
    }

    static sum<T extends point>(a: T, b: T): T {
        return {x: a.x + b.x, y: a.y + b.y} as T
    }

    static dist(a: point, b: point) {
        let c = geom.minus(a, b)
        return geom.norm(c)
    }

    static mult<T extends point>(a: T, c: number): T {
        return {x: a.x * c, y: a.y * c} as T
    }

    static intify(a: point) {
        return {x: Math.floor(a.x), y: Math.floor(a.y)}
    }

    static copy<T extends point>(a: T): T {
        return {x: a.x, y: a.y} as T
    }
}


