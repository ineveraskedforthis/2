//CHARACTER 2D IMAGE DISPLAY

import { Socket } from "../../../shared/battle_data.js"
import { CharacterImageData } from "../../../shared/inventory.js"
import { elementById } from "../HTMLwrappers/common.js"
import { load, render, update_rects, RenderingData, TexturedRect } from "./render.js"
import { EQUIPMENT_TAGS, display_layers } from "./equip_strings.js";

const HEIGHT = 1080
const WIDTH = 1920

var flag_init = false;

var render_data: RenderingData|null = null

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

    let context = canvas.getContext("webgl")

    if (context != null) {
        render_data = load(context)
    }

    flag_init = true;
}

const near = 3370 / 2;
const observer_height = 1147 / 2;
const far = 10000


export function number_to_depth(id: number) {
    return (Math.sin(Math.floor(id / 6)) + 1) * near / 4;
}

export function number_to_position(id: number, step: number) : {x: number, orientation: number, distance: number} {
    let x_pos = Math.cos(id * Math.E * 10) * WIDTH * 0.5;
    const orientation = (((id % 2) - 0.5) * 2);

    const depth = number_to_depth(id);

    return {
        x: x_pos,
        orientation: orientation,
        distance: near + depth
    };
}

const epsilon_depth = -0.00001

let ratio = WIDTH / HEIGHT

const perspective_matrix = [
    2 * near / WIDTH, 0, 0, 0,
    0, 2 * near / HEIGHT, 0, 0,
    0, 0, -(far + near) / (near - far), 1,
    0, 0, near * far / (near - far) * 2, 0
];

const view_matrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, -observer_height * 2, 0, 1
];

export function update_local_npc_images(data: CharacterImageData[]) {
    if (render_data == null) {
        return
    }

    let objects: TexturedRect[] = []

    for (let character of data) {

        const transform = number_to_position(character.id, 25)
        console.log("transform")
        console.log(transform)

        let w = 1
        let h = 1 * 1.42;
        let d = transform.distance

        function name_to_rect(s: string): TexturedRect {
            return {
                x: transform.x,
                w: w * transform.orientation,
                h: h,
                d: d,
                texture_name: s
            }
        }

        if (character.dead) {
            objects.push(name_to_rect(`${character.body}_dead`))
            continue
        }

        for (let tag of EQUIPMENT_TAGS.slice().reverse()) {
            let item = character.equip[tag]?.prototype_id
            if (item == undefined) {
                continue
            }

            d+=epsilon_depth
            objects.push(name_to_rect(`${character.body}_behind_all_${item}`))
        }

        d+=epsilon_depth
        objects.push(name_to_rect(`${character.body}_body_0`))

        for (let tag of EQUIPMENT_TAGS) {
            let item = character.equip[tag]?.prototype_id
            if (item == undefined) {
                continue
            }

            d+=epsilon_depth
            objects.push(name_to_rect(`${character.body}_behind_body_${item}`))
        }

        d+=epsilon_depth
        objects.push(name_to_rect(`${character.body}_body_1`))

        for (let tag of EQUIPMENT_TAGS) {
            let item = character.equip[tag]?.prototype_id
            if (item == undefined) {
                continue
            }

            d+=epsilon_depth
            objects.push(name_to_rect(`${character.body}_behind_right_arm_${item}`))
        }

        d+=epsilon_depth
        objects.push(name_to_rect(`${character.body}_body_2`))

        for (let tag of EQUIPMENT_TAGS) {
            let item = character.equip[tag]?.prototype_id
            if (item == undefined) {
                continue
            }
            d+=epsilon_depth
            objects.push(name_to_rect(`${character.body}_on_top_${item}`))
        }
    }

    update_rects(render_data)
    objects.sort((a, b) => -a.d + b.d)
    render(render_data, objects, perspective_matrix, view_matrix)
}