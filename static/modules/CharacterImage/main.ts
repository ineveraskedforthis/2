//CHARACTER 2D IMAGE DISPLAY

import { Socket } from "../../../shared/battle_data.js"
import { CharacterImageData } from "../../../shared/inventory.js"
import { elementById } from "../HTMLwrappers/common.js"
import { ImageComposer } from "./ImageGenerator/image_generator.js"

const HEIGHT = 1080
const WIDTH = 1920

var flag_init = false;

export function set_up_character_model(socket: Socket) {
    const canvas = document.createElement("canvas")
    canvas.width = WIDTH
    canvas.height = HEIGHT
    // canvas.style.width = ( 100 * window.screen.width / 1920 ).toFixed(1) + "%"
    // canvas.style.height = ( 100 * window.screen.height / 1080 ).toFixed(1) + "%"

    canvas.style.scale = (window.screen.height / canvas.height).toFixed(1)

    canvas.id = "super_cool_canvas"
    canvas.classList.add('character_image')

    elementById("character_image_display").appendChild(canvas)

    flag_init = true;
}

const distance_to_camera = 3370 / 2;
const observer_height = 1147 / 2;

export function number_to_depth(id: number) {
    return (Math.sin(Math.floor(id / 6)) + 1) * distance_to_camera / 4
}

export function number_to_position(id: number, step: number) : {x: number, y: number, orientation: number, scale: number} {
    let x_pos = (step * ((id * 5) % 7)) * (1 + Math.sin(id)) / 2;
    const orientation = (((id % 2) - 0.5) * 2)
    if (orientation == -1) {
        x_pos += 1920;
    }
    // x_pos -= 200;
    x_pos *= 0.6;
    x_pos += 100;
    const depth = number_to_depth(id)

    const scale = ((distance_to_camera) / (distance_to_camera + depth))
    const vertical_pp_shift = observer_height - observer_height * scale

    return {
        x: x_pos,
        y: -vertical_pp_shift + HEIGHT * (1 - scale),
        orientation: orientation,
        scale: scale
    }
}


export function draw_npc_by_index(data: CharacterImageData[], step: number, indices: number[], index_of_index: number, canvas_context: CanvasRenderingContext2D, height: number) {

    if (indices[index_of_index] == undefined) return;

    const transform = number_to_position(data[indices[index_of_index]].id, step)
    console.log("transform")
    console.log(transform)

    canvas_context.setTransform(
        transform.orientation * transform.scale, 0,
        0, transform.scale,
        transform.x, transform.y
    )

    // for (let i = -10; i <= 10; i++) {
    //     for (let j = -10; j <= 10; j++) {
    //         canvas_context.strokeText(`${i} ${j}`, i * 50, j * 50)
    //     }
    // }

    ImageComposer.update_equip_image(
        canvas_context,
        data[indices[index_of_index]].body,
        data[indices[index_of_index]].equip,
        data[indices[index_of_index]].dead,
        0,
        height,
        () => {
            setTimeout(() => draw_npc_by_index(data, step, indices, index_of_index + 1, canvas_context, height), 25)
        }
    )
}

export function update_local_npc_images(data: CharacterImageData[]) {
    const canvas = elementById("super_cool_canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;
    context.resetTransform()
    context.clearRect(0, 0, canvas.width, canvas.height)
    const indices = data.map((value, index) => index)
    indices.sort((a, b) => -number_to_depth(data[a].id) + number_to_depth(data[b].id))

    draw_npc_by_index(data, (window.screen.width - 400) / 7, indices, 0, context, canvas.height)
}