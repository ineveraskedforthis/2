export var geom2;
(function (geom2) {
    function diff(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    geom2.diff = diff;
    function dist(a, b) {
        return norm(diff(b, a));
    }
    geom2.dist = dist;
    function norm(a) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    }
    geom2.norm = norm;
    function sum(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    geom2.sum = sum;
    function scalar_mult(x, a) {
        return { x: x * a.x, y: x * a.y };
    }
    geom2.scalar_mult = scalar_mult;
    function image_to_canvas(position, w, h) {
        return [position.x - w / 10, position.y - h / 5 + 10, w / 5, h / 5];
    }
    geom2.image_to_canvas = image_to_canvas;
})(geom2 || (geom2 = {}));
export var geom3;
(function (geom3) {
    function dot3(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    geom3.dot3 = dot3;
    function dist(a, b) {
        const c = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        return Math.sqrt(dot3(c, c));
    }
    geom3.dist = dist;
})(geom3 || (geom3 = {}));
