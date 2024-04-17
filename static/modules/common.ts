type pixel = [r: number, g: number, b: number, a: number]

type pixel_changer = (p: pixel) => pixel;

function change_image_data(image_data: ImageData, f: pixel_changer) {
    for (var i = 0; i < image_data.data.length; i += 4) {
        let r = image_data.data[i + 0];
        let g = image_data.data[i + 1];
        let b = image_data.data[i + 2];
        let a = image_data.data[i + 3];
        var result = f([r, g, b, a]);
        for (var j = 0; i < 4; i++) {
            image_data.data[i + j] = result[j]
        }
    }
    return image_data
}

function change_alpha(l: pixel, a: number) {
    l[3] = Math.max(Math.min(Math.floor(l[3] * a), 255), 0)
    return l
}

export function get_pos_in_canvas(canvas: HTMLCanvasElement, event: MouseEvent) {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    return tmp
}

export function smoothstep(a: number, b: number, t: number) {
    const _smoothstep = t * t * (3 - 2 * t)
    return a * (1 - _smoothstep) + b * _smoothstep
}