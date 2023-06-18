
import { position, unit_id, battle_position, UnitSocket } from "../../../shared/battle_data.js"
import { AnimationDict } from "../load_images.js"
import { AnimatedImage } from "./animation.js"
import { h, w } from "./battle_image.js"
import { BATTLE_SCALE } from "./constants.js"

declare var alert: (data: string) => {}


const NAMEPLATE_SHIFT_X = 0
const NAMEPLATE_SHIFT_Y = 0

export type canvas_position = position & { __brand: "canvas"}


export namespace position_c {

    export function diff<Type extends position>(a: Type, b: Type): Type {
        return {x: a.x - b.x, y:a.y - b.y} as Type
    }

    export function dist<Type extends position>(a: Type, b: Type):number {
        return norm(diff(b, a))
    }

    export function norm<Type extends position>(a: Type): number {
        return Math.sqrt(a.x * a.x + a.y * a.y)
    }

    export function sum<Type extends position>(a: Type, b: Type): Type {
        return {x: a.x + b.x, y:a.y + b.y} as Type
    }

    export function scalar_mult<Type extends position>(x: number, a: Type): Type {
        return {x: x * a.x, y: x * a.y} as Type
    }

    export function battle_to_canvas(pos: battle_position, camera: canvas_position) {
        let centre = {x: pos.y, y: pos.x};
        centre.x = -centre.x * BATTLE_SCALE + w / 2 + camera.x;
        centre.y = centre.y * BATTLE_SCALE + h / 2 + camera.y;
        return raw_to_canvas(centre)
    }

    export function canvas_to_battle(pos: canvas_position) {
        let tmp = {x: pos.x, y: pos.y}
        tmp.x = (tmp.x - w / 2) / (-BATTLE_SCALE);
        tmp.y = (tmp.y - h / 2) / (BATTLE_SCALE)
        return raw_to_battle({x: tmp.y, y: tmp.x})
    }

    export function raw_to_battle(pos: position) {
        return pos as battle_position
    }

    export function raw_to_canvas(pos: position) {
        return pos as canvas_position
    }

    export function image_to_canvas(position:canvas_position, w:number, h:number):[number, number, number, number] {
        // let w = image.get_w(images);
        // let h = image.get_h(images);
        return [position.x - w/10, position.y - h/5 + 10, w/5, h/5]
    }
}

export function get_mouse_pos_in_canvas(canvas:HTMLCanvasElement, event: any): canvas_position {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    return position_c.raw_to_canvas(tmp)
}

// export class BattleUnit {
//     id: unit_id
//     name: string
//     hp: number
//     max_hp: number
//     ap: number
//     range: number
//     position: battle_position
//     killed: boolean
//     tag: string

//     constructor(unit: UnitSocket) {
//         this.id = unit.id
//         this.name = unit.name
//         this.hp = unit.hp
//         this.max_hp = unit.max_hp
//         this.ap = unit.ap
//         this.range = unit.range
//         this.position = unit.position
//         this.killed = false
//         if (unit.hp == 0) {
//             this.killed = true
//         }
//         this.tag = unit.tag
//     }

//     update(hp: number, ap: number, position: battle_position, range: number) {
//         if (hp != undefined) this.hp = hp;
//         if (ap != undefined) this.ap = ap
//         if (position != undefined) this.position = position
//         if (range != undefined) this.range = range
//         if (hp == 0) {
//             this.killed = true
//         }
//     }
// }

export interface animation_event {
    type: "move"|"attack"|"update"|'attacked'
    data: any
}

