const mat4 = glMatrix.mat4;
const vec4 = glMatrix.vec4;

function draw_image(context, image, x, y, w, h) {
    context.drawImage(image, x, y, w, h)
}

function change_image_data(image_data, f) {
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

function change_alpha(l, a) {
    l[3] = Math.max(Math.min(Math.floor(l[3] * a), 255), 0)
    return l
}

