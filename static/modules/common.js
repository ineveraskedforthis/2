function change_image_data(image_data, f) {
    for (var i = 0; i < image_data.data.length; i += 4) {
        let r = image_data.data[i + 0];
        let g = image_data.data[i + 1];
        let b = image_data.data[i + 2];
        let a = image_data.data[i + 3];
        var result = f([r, g, b, a]);
        for (var j = 0; i < 4; i++) {
            image_data.data[i + j] = result[j];
        }
    }
    return image_data;
}
function change_alpha(l, a) {
    l[3] = Math.max(Math.min(Math.floor(l[3] * a), 255), 0);
    return l;
}
export function get_pos_in_canvas(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    return tmp;
}
export function smoothstep(a, b, t) {
    if (t > 1) {
        return b;
    }
    if (t < 0) {
        return a;
    }
    if (a == b) {
        return a;
    }
    const _smoothstep = t * t * (3 - 2 * t);
    return a * (1 - _smoothstep) + b * _smoothstep;
}
export function lerp(a, b, t) {
    if (t > 1) {
        return b;
    }
    if (t < 0) {
        return a;
    }
    return a * (1 - t) + b * t;
}
