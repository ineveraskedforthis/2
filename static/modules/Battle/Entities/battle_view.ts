import { character_id } from "@custom_types/ids.js"
import { battle_position, UnitSocket } from "../../../../shared/battle_data.js"
import { AnimatedImage } from "./animation.js"

import {
    animation_event,
    canvas_position,
    geom2,
} from "../battle_image_helper.js"

import { BATTLE_SCALE } from "../constants.js"

export class BattleUnitView {
    id: character_id
    position: battle_position
    hp: number
    max_hp: number
    hp_change: number
    ap: number
    max_ap: number
    ap_change:number
    move_cost: number

    name: string
    side_bar_div: any
    killed: boolean
    // unit: BattleUnit
    range: number
    a_image: AnimatedImage
    animation_timer: number
    animation_something: number
    current_animation: animation_event|undefined
    next_turn: number

    timer: number

    orientation: 'left'|'right'

    constructor(unit: UnitSocket) {
        this.id = unit.id
        this.name = unit.name
        this.range = unit.range
        // this.unit = unit
        this.killed = (unit.hp == 0)
        this.position = unit.position
        this.ap = unit.ap
        this.ap_change = 0
        this.max_ap = 0
        this.hp = unit.hp
        this.max_hp = unit.max_hp
        this.hp_change = 0
        this.animation_timer = 0
        this.animation_something = 0
        this.move_cost = unit.move_cost

        this.next_turn = unit.next_turn

        this.a_image = new AnimatedImage(unit.tag)

        this.orientation = 'right'

        this.timer = 0
    }

    update(hp_change: number, ap_change: number) {
        this.hp_change = hp_change
        this.ap_change = ap_change
    }
}