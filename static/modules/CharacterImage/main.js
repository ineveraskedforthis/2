//CHARACTER 2D IMAGE DISPLAY
import { elementById } from "../HTMLwrappers/common.js";
import { ImageComposer } from "./ImageGenerator/image_generator.js";
var flag_init = false;
export function set_up_character_model(socket) {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    // canvas.style.width = ( 100 * window.screen.width / 1920 ).toFixed(1) + "%"
    // canvas.style.height = ( 100 * window.screen.height / 1080 ).toFixed(1) + "%"
    canvas.style.scale = (window.screen.height / canvas.height).toFixed(1);
    canvas.id = "super_cool_canvas";
    canvas.classList.add('character_image');
    elementById("character_image_display").appendChild(canvas);
    flag_init = true;
}
export function number_to_depth(id) {
    return -Math.floor(-id / 6) * 20;
}
export function number_to_position(id, step) {
    let x_pos = (step * ((id * 5) % 7));
    const orientation = (((id % 2) - 0.5) * 2);
    if (orientation == -1) {
        x_pos += 1920;
    }
    // x_pos -= 200;
    x_pos *= 0.5;
    const y_pos = number_to_depth(id);
    const scale = ((800 + y_pos) / (800));
    return {
        x: x_pos,
        y: y_pos,
        orientation: orientation,
        scale: scale
    };
}
export function draw_npc_by_index(data, step, indices, index_of_index, canvas_context, height) {
    if (indices[index_of_index] == undefined)
        return;
    const transform = number_to_position(data[indices[index_of_index]].id, step);
    console.log(transform);
    canvas_context.setTransform(transform.orientation * transform.scale, 0, 0, transform.scale, transform.x, transform.y);
    for (let i = -10; i <= 10; i++) {
        for (let j = -10; j <= 10; j++) {
            canvas_context.strokeText(`${i} ${j}`, i * 50, j * 50);
        }
    }
    ImageComposer.update_equip_image(canvas_context, data[indices[index_of_index]].body, data[indices[index_of_index]].equip, 0, height, () => {
        setTimeout(() => draw_npc_by_index(data, step, indices, index_of_index + 1, canvas_context, height), 25);
    });
}
export function update_local_npc_images(data) {
    const canvas = elementById("super_cool_canvas");
    const context = canvas.getContext("2d");
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);
    const indices = data.map((value, index) => index);
    indices.sort((a, b) => number_to_depth(data[a].id) - number_to_depth(data[b].id));
    draw_npc_by_index(data, (window.screen.width - 400) / 7, indices, 0, context, canvas.height);
}
