import { BattleImageNext } from "./battle_image.js"

import { position, unit_id, battle_position, UnitSocket } from "../../../shared/battle_data"
import { BattleUnitView } from "./battle_view.js"

declare var alert: (data: string) => {}


const NAMEPLATE_SHIFT_X = 0
const NAMEPLATE_SHIFT_Y = 0

export type canvas_position = position & { __brand: "canvas"}


export type Canvas = any & { __brand: "canvas"};
export type CanvasContext = any & { __brand: "canvas_context"};
export type ImagesDict = {[_: string] : Image}
export type Image = any & { __brand: "image"};

export const BATTLE_SCALE = 50
export const BATTLE_MOVEMENT_SPEED = 4
export const BATTLE_ANIMATION_TICK = 1 / 15
export const BATTLE_ATTACK_DURATION = 0.5

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

    export function battle_to_canvas(pos: battle_position, canvas_h: number, canvas_w: number) {
        let centre = {x: pos.y, y: pos.x};
        centre.x = -centre.x * BATTLE_SCALE + 520;
        centre.y = centre.y * BATTLE_SCALE + canvas_h / 2;
        return raw_to_canvas(centre)
    }

    export function canvas_to_battle(pos: canvas_position, canvas_h: number, canvas_w: number) {
        let tmp = {x: pos.x, y: pos.y}
        tmp.x = (tmp.x - 520) / (-BATTLE_SCALE);
        tmp.y = (tmp.y - canvas_h / 2) / (BATTLE_SCALE)
        return raw_to_battle({x: tmp.y, y: tmp.x})
    }

    export function raw_to_battle(pos: position) {
        return pos as battle_position
    }
    export function raw_to_canvas(pos: position) {
        return pos as canvas_position
    }
    export function image_to_canvas(position:canvas_position, image: AnimatedImage, images:ImagesDict):[number, number, number, number] {
        let w = image.get_w(images);
        let h = image.get_h(images);
        return [position.x - w/10, position.y - h/5 + 10, w/5, h/5]
    }
}


export function draw_image(context:CanvasContext, image:Image, x:number, y:number, w:number, h:number) {
    context.drawImage(image, x, y, w, h)
}

export function get_mouse_pos_in_canvas(canvas:CanvasContext, event: any): canvas_position {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    return position_c.raw_to_canvas(tmp)
}

export class AnimatedImage {
    tag: string;
    current: number;
    action: string;
    animation_tick: number

    constructor(image_name:string) {
        this.tag = image_name;
        this.current = 0
        this.action = 'idle'
        this.animation_tick = 0
    }

    get_image_name() {
        return this.tag + '_' + this.action + '_' + ("0000" + this.current).slice(-4)
    }
    
    update(dt: number, images:ImagesDict) {
        this.animation_tick += dt
        while (this.animation_tick > BATTLE_ANIMATION_TICK) {
            this.current += 1;
            this.animation_tick = this.animation_tick - BATTLE_ANIMATION_TICK
            if (!(this.get_image_name() in images)) {
                this.current = 0
            }
        }        
    }

    set_action(tag:"move"|"idle"|"attack") {
        if (tag != this.action ){
            this.action = tag
            this.current = 0;
        }
    }

    get_w(images:ImagesDict) {
        return images[this.get_image_name()].width
    }
    
    get_h(images:ImagesDict) {
        return images[this.get_image_name()].height
    }

    // data is [x, y, w, h]
    draw(ctx: CanvasContext, data: [number, number, number, number], images:ImagesDict) {
        draw_image(ctx, images[this.get_image_name()], Math.floor(data[0]), Math.floor(data[1]), Math.floor(data[2]), Math.floor(data[3]))
    }
}


export class MovementBattleEvent {
    type: 'movement'
    target: battle_position
    unit_id: unit_id

    constructor(unit_id: unit_id, target: battle_position) {
        this.type = 'movement'   
        this.target = target    
        this.unit_id = unit_id 
    }

    effect(battle: BattleImageNext) {
        let unit_view = battle.units_views[this.unit_id]
        unit_view.animation_sequence.push({type: 'move', data: ''})
    }

    generate_log_message(battle: BattleImageNext):string {
        let unit = battle.units_data[this.unit_id]
        return unit.name + ' moved (' + this.target.x + ' ' + this.target.y + ')'
    }
}

export class UpdateDataEvent {
    type: 'update'
    unit: unit_id
    data: UnitSocket

    constructor(unit_id: unit_id, data: UnitSocket) {
        this.unit = unit_id
        this.data = data
        this.type = 'update'
    }

    effect(battle: BattleImageNext) {
        if (battle.units_data[this.unit] == undefined) {
            battle.add_fighter(
                this.unit, 
                this.data.tag, 
                this.data.position as battle_position, this.data.range, this.data.name, 
                this.data.hp, this.data.max_hp, this.data.ap)
        }
        battle.units_data[this.unit].update(
            this.data.hp, this.data.ap, 
            this.data.position as battle_position, this.data.range)
        battle.units_views[this.unit].animation_sequence.push({type: 'update', data: ''})
    }

    generate_log_message():string {
        return 'ok'
    }
}

export class ClearBattleEvent {
    type: 'clear' 

    constructor() {
        this.type = 'clear'
    }

    effect(battle: BattleImageNext) {
        console.log('clear battle')
        battle.reset_data()
        battle.in_progress = false
    }

    generate_log_message():string {
        return "battle is finished"
    }
}

function get_attack_direction(a: BattleUnitView, d: BattleUnitView) {
    let hor = 'left'
    if (a.position.x < d.position.x) {
        hor = 'right'
    }

    let ver = 'up'
    if (a.position.y < d.position.y) {
        ver = 'down'
    }

    return hor + '_' + ver
}

export class AttackEvent {
    type: 'attack'
    unit_id: unit_id
    target_id: unit_id

    constructor(unit: unit_id, target: unit_id) {
        this.type = 'attack'
        this.unit_id = unit
        this.target_id = target
    }

    effect(battle: BattleImageNext) {
        let unit_view_attacker = battle.units_views[this.unit_id]
        let unit_view_defender = battle.units_views[this.target_id]

        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position)
        direction_vec = position_c.scalar_mult(1/position_c.norm(direction_vec), direction_vec) 

        unit_view_defender.animation_sequence.push({type: 'attacked', data: {direction: direction_vec, dodge: false}})
        unit_view_attacker.animation_sequence.push({type: 'attack', data: direction_vec})
        
        // unit_view_defender.animation_sequence.push('attack')
    }

    generate_log_message(battle: BattleImageNext):string {
        let unit = battle.units_data[this.unit_id]
        let target = battle.units_data[this.target_id]
        let result = unit.name + ' attacks ' + target.name + ': '
        return result + ' HIT!'
    }
}

export class MissEvent {
    type: 'miss'
    unit_id: unit_id
    target_id: unit_id

    constructor(unit: unit_id, target: unit_id) {
        this.type = 'miss'
        this.unit_id = unit
        this.target_id = target 
    }

    effect(battle: BattleImageNext) {
        let unit_view_attacker = battle.units_views[this.unit_id]
        let unit_view_defender = battle.units_views[this.target_id]

        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position)
        direction_vec = position_c.scalar_mult(1/position_c.norm(direction_vec), direction_vec) 

        unit_view_defender.animation_sequence.push({type: 'attacked', data: {direction: direction_vec, dodge: true}})
    }

    generate_log_message(battle: BattleImageNext):string {
        let unit = battle.units_data[this.unit_id]
        let target = battle.units_data[this.target_id]
        let result = unit.name + ' attacks ' + target.name + ': '
        return result + ' MISS!';
    }
}

export class RetreatEvent {
    type: 'retreat'
    unit_id: unit_id
    
    constructor(unit_id: unit_id) {
        this.unit_id = unit_id
        this.type = 'retreat'
    }

    effect(battle: BattleImageNext) {
        if (this.unit_id == battle.player_id) {
            alert('You had retreated from the battle')
        } else {
            alert('Someone had retreated from the battle')
        }
    }

    generate_log_message(battle: BattleImageNext):string {
        let unit = battle.units_data[this.unit_id]
        return unit.name + ' retreats'
    }
}





export class NewTurnEvent {
    type: 'new_turn'
    unit:unit_id

    constructor(unit: unit_id) {
        this.type = 'new_turn'
        this.unit = unit
    }

    effect(battle: BattleImageNext) {
        battle.set_current_turn(this.unit)
    }

    generate_log_message():string {
        return 'new_turn'
    }
}


export type BattleEvent = MovementBattleEvent|UpdateDataEvent|ClearBattleEvent|AttackEvent|NewTurnEvent|RetreatEvent|MissEvent


export class BattleUnit {
    id: unit_id
    name: string
    hp: number
    max_hp: number
    ap: number
    range: number
    position: battle_position
    killed: boolean
    tag: string

    constructor(id: unit_id, name: string, hp: number, max_hp: number, ap: number, range: number, position: battle_position, tag: string) {
        this.id = id
        this.name = name
        this.hp = hp
        this.max_hp = max_hp
        this.ap = ap
        this.range = range
        this.position = position
        this.killed = false
        if (hp == 0) {
            this.killed = true
        }
        this.tag = tag
    }

    update(hp: number, ap: number, position: battle_position, range: number) {
        if (hp != undefined) this.hp = hp;
        if (ap != undefined) this.ap = ap
        if (position != undefined) this.position = position
        if (range != undefined) this.range = range
        if (hp == 0) {
            this.killed = true
        }
    }
}

export interface animation_event {
    type: "move"|"attack"|"update"|'attacked'
    data: any
}

