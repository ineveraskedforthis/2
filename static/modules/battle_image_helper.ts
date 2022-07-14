import { BattleImageNext } from "./battle_image.js"

import { SocketBattleUnitData, battle_id } from "../../shared/battle_data"

declare var alert: (data: string) => {}

interface position {
    x: number
    y: number
}

export type battle_position = position & { __brand: "battle"}
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
    unit_id: battle_id

    constructor(unit_id: battle_id, target: battle_position) {
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
    unit: battle_id
    data: SocketBattleUnitData

    constructor(unit_id: battle_id, data: SocketBattleUnitData) {
        this.unit = unit_id
        this.data = data
        this.type = 'update'
    }

    effect(battle: BattleImageNext) {
        battle.units_data[this.unit].update(this.data.hp, this.data.ap, this.data.position as battle_position)
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
    unit_id: battle_id
    target_id: battle_id
    data: any

    constructor(unit: battle_id, target: battle_id, data: any) {
        this.type = 'attack'
        this.unit_id = unit
        this.target_id = target 
        this.data = data
    }

    effect(battle: BattleImageNext) {
        let unit_view_attacker = battle.units_views[this.unit_id]
        let unit_view_defender = battle.units_views[this.target_id]

        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position)
        direction_vec = position_c.scalar_mult(1/position_c.norm(direction_vec), direction_vec) 

        if (this.data.flags.evade || this.data.flags.miss) {
            unit_view_defender.animation_sequence.push({type: 'attacked', data: {direction: direction_vec, dodge: true}})
        } else {
            unit_view_defender.animation_sequence.push({type: 'attacked', data: {direction: direction_vec, dodge: false}})
        }
        unit_view_attacker.animation_sequence.push({type: 'attack', data: direction_vec})
        
        // unit_view_defender.animation_sequence.push('attack')
    }

    generate_log_message(battle: BattleImageNext):string {
        let unit = battle.units_data[this.unit_id]
        let target = battle.units_data[this.target_id]
        let result = unit.name + ' attacks ' + target.name + ': '

        if (this.data.flags.evade || this.data.flags.miss) {
            return result + ' MISS!';
        }
        if (this.data.flags.crit) {
            return result + this.data.total_damage + ' damage (CRITICAL)'
        }        
        return result + this.data.total_damage + ' damage'
    }
}

export class RetreatEvent {
    type: 'retreat'
    unit_id: battle_id
    
    constructor(unit_id: battle_id) {
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
    unit:battle_id

    constructor(unit: battle_id) {
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


export type BattleEvent = MovementBattleEvent|UpdateDataEvent|ClearBattleEvent|AttackEvent|NewTurnEvent|RetreatEvent


export class BattleUnit {
    id: battle_id
    name: string
    hp: number
    ap: number
    range: number
    position: battle_position
    killed: boolean
    tag: string

    constructor(id: battle_id, name: string, hp: number, ap: number, range: number, position: battle_position, tag: string) {
        this.id = id
        this.name = name
        this.hp = hp
        this.ap = ap
        this.range = range
        this.position = position
        this.killed = false
        if (hp == 0) {
            this.killed = true
        }
        this.tag = tag
    }

    update(hp: number, ap: number, position: battle_position) {
        if (hp != undefined) this.hp = hp;
        if (ap != undefined) this.ap = ap
        if (position != undefined) this.position = position

        if (hp == 0) {
            this.killed = true
        }
    }
}

interface animation_event {
    type: "move"|"attack"|"update"|'attacked'
    data: any
}

export class BattleUnitView {
    side_bar_div: any
    position: battle_position
    killed: boolean
    ap: number
    hp: number
    unit: BattleUnit
    a_image: AnimatedImage
    animation_timer: number
    animation_something: number

    animation_sequence: animation_event[]
    
    constructor(unit: BattleUnit) {
        this.unit = unit
        this.killed = unit.killed
        this.position = unit.position
        this.ap = unit.ap
        this.hp = unit.hp
        this.animation_sequence = []
        this.animation_timer = 0
        this.animation_something = 0

        this.a_image = new AnimatedImage(unit.tag)
    }
    
    update(battle: BattleImageNext) {
        if (battle.player_id == this.unit.id) {
            battle.update_player_actions_availability()
        }
        this.hp = this.unit.hp
        this.ap = this.unit.ap 
        this.killed = this.unit.killed

        let div = battle.container.querySelector('.enemy_list > .fighter_' + this.unit.id)
        div.innerHTML = this.unit.name + '<br> hp: ' + this.unit.hp + '<br> ap: ' + Math.floor(this.unit.ap * 10) / 10
    }

    handle_events(dt: number, battle: BattleImageNext, images:ImagesDict) {

        let unit = this.unit

        let direction = position_c.diff(unit.position, this.position)
        let norm = position_c.norm(direction)

         //handling animation sequence 
        let flag_animation_finished = false

        if (this.animation_sequence.length > 0) {
            let event = this.animation_sequence[0]
            switch(event.type) {
                case "move": {
                    // update position and change animation depending on movement
                    if (norm < BATTLE_MOVEMENT_SPEED * dt) {
                        this.position = unit.position
                        this.a_image.set_action('idle')
                        flag_animation_finished = true
                    } else {
                        this.position = position_c.sum( this.position, 
                                                        position_c.scalar_mult(BATTLE_MOVEMENT_SPEED / norm * dt, direction))
                            
                        this.a_image.set_action('move')
                    }
                    break
                }
                case "attack": {
                    this.a_image.set_action('attack')
                    this.animation_timer += dt

                    let scale = -Math.sin(this.animation_timer / BATTLE_ATTACK_DURATION * Math.PI)/2
                    let shift = position_c.scalar_mult(scale, event.data as battle_position)
                    this.position = position_c.sum(this.unit.position, shift)
                    
                    if (this.animation_timer > BATTLE_ATTACK_DURATION) {
                        flag_animation_finished = true
                        this.animation_timer = 0
                        this.position = this.unit.position
                        this.animation_something = 1 - this.animation_something
                    }
                    break
                }
                case "attacked": {

                    this.animation_timer += dt

                    if (event.data.dodge) {
                        let scale = -Math.sin(this.animation_timer / BATTLE_ATTACK_DURATION * Math.PI) * 2
                        let shift = position_c.scalar_mult(scale, event.data.direction as battle_position)
                        this.position = position_c.sum(this.unit.position, shift)
                    } else {
                        let position = position_c.battle_to_canvas(this.unit.position, battle.h, battle.w)
                        battle.canvas_context.drawImage(images['attack_' + this.animation_something], position.x - 50, position.y - 80, 100, 100)
                    }

                    

                    if (this.animation_timer > BATTLE_ATTACK_DURATION) {
                        flag_animation_finished = true
                        this.animation_timer = 0
                        this.position = this.unit.position
                        this.animation_something = 1 - this.animation_something
                    }
                    break
                }
                case "update": {
                    this.update(battle)
                    flag_animation_finished = true
                    break
                }
            }
        } else {
            flag_animation_finished = true
        }
        
        // remove one animation from sequence, when it is finished
        if ((flag_animation_finished) && (this.animation_sequence.length > 0)){
            // console.log('animation finished')
            // console.log(this.animation_sequence[0].type)
            this.a_image.set_action('idle')
            this.animation_sequence.splice(0, 1)
        }
    }

    draw(dt: number, battle: BattleImageNext, images:ImagesDict) {
        if (this.killed) {
            return
        }
        let unit = this.unit

        let pos = position_c.battle_to_canvas(this.position, battle.h, battle.w)
        let ctx = battle.canvas_context

        //draw character attack radius circle and color it depending on it's status in ui
        ctx.strokeStyle = "rgba(0, 0, 0, 1)"
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * unit.range, 0, 2 * Math.PI);
        if (battle.selected == unit.id) {
            ctx.fillStyle = "rgba(10, 10, 200, 0.7)" // blue if selecter
        } else if (battle.hovered == unit.id) {
            ctx.fillStyle = "rgba(0, 230, 0, 0.7)" // green if hovered and not selecter
        } else {
            ctx.fillStyle = "rgba(200, 200, 0, 0.5)" // yellow otherwise
        }
        ctx.fill();

        //draw a border of circle above
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * unit.range, 0, 2 * Math.PI);
        ctx.stroke();

        //draw small circle at unit's base
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE/10, 0, 2 * Math.PI);
        ctx.stroke();


        //draw nameplates

        ctx.font = '15px serif';
        // select style depending on hover/selection status
        if (battle.selected == unit.id) {
            ctx.fillStyle = "rgba(1, 1, 1, 1)"
            ctx.strokeStyle = "rgba(0, 0, 0, 1)"
        } else if (battle.hovered == unit.id) {
            ctx.fillStyle = "rgba(1, 1, 1, 1)"
            ctx.strokeStyle = "rgba(0, 0, 0, 1)"
            
        } else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
            ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
        }

        // draw an actual nameplate
        ctx.strokeRect(pos.x - 50, pos.y - 120, 100, 20)
        ctx.strokeRect(pos.x - 50, pos.y - 100, 100, 20)
        let string = unit.name
        if (unit.id == battle.player_id) {
            string = string + '(YOU)'
        }
        ctx.fillText(string + ' || ' + this.hp + ' hp', pos.x - 45, pos.y - 105);
        ctx.fillText('ap:  ' + Math.floor(this.ap * 10) / 10, pos.x - 45, pos.y - 85);

        // draw character's image
        let image_pos = position_c.image_to_canvas(pos, this.a_image, images)
        this.a_image.draw(battle.canvas_context, image_pos, images)
        this.a_image.update(dt, images)

        this.handle_events(dt, battle, images)
    }  
}