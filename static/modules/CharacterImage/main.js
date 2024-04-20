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
export function draw_npc_by_index(data, step, index, canvas_context, height) {
    let x_pos = (step * ((index * 5) % 7));
    const orientation = (((index % 2) - 0.5) * 2);
    if (orientation == -1) {
        x_pos += 1920;
    }
    x_pos *= 0.7;
    const y_pos = -Math.floor(-index / 6) * 20;
    const scale = ((800 + y_pos) / (800));
    console.log(step.toFixed(1), x_pos, y_pos, orientation, scale);
    canvas_context.setTransform(orientation * scale, 0, 0, scale, x_pos, y_pos);
    if (data[index] == undefined)
        return;
    ImageComposer.update_equip_image(canvas_context, data[index].body, data[index].equip, 0, height, () => {
        setTimeout(() => draw_npc_by_index(data, step, index + 1, canvas_context, height), 25);
    });
}
export function update_local_npc_images(data) {
    const canvas = elementById("super_cool_canvas");
    const context = canvas.getContext("2d");
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw_npc_by_index(data, (window.screen.width - 400) / 7, 0, context, canvas.height);
}
