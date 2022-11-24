"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geom = void 0;
class geom {
    static norm(data) {
        return Math.sqrt(geom.norm2(data));
    }
    static norm2(v) {
        return v.x * v.x + v.y * v.y;
    }
    static normalize(v) {
        let n = geom.norm(v);
        return { x: v.x / n, y: v.y / n };
    }
    static minus(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    static dist(a, b) {
        let c = geom.minus(a, b);
        return geom.norm(c);
    }
    static mult(a, c) {
        return { x: a.x * c, y: a.y * c };
    }
    static intify(a) {
        return { x: Math.floor(a.x), y: Math.floor(a.y) };
    }
}
exports.geom = geom;
