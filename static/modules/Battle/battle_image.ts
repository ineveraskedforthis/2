import {canvas_position, get_mouse_pos_in_canvas, position_c} from './battle_image_helper.js'

import { BattleData, unit_id, UnitSocket, battle_position } from "../../../shared/battle_data.js"
import { BattleUnitView } from './battle_view.js';
import { socket } from '../globals.js';
import { BattleImageEvent } from './battle_image_events.js';
import { AnimatedImage } from './animation.js';
import { BATTLE_SCALE } from './constants.js';
import { AnimationDict, IMAGES, ImagesDict } from '../load_images.js';
import { timeEnd } from 'console';

declare var alert: (data: string) => {}


interface battle_action {
    name: string,
    tag: string,
    cost?: number
    probabilistic?: boolean
    damaging?: boolean
}


function build_unit_div(unit_data: BattleUnitView, div: HTMLDivElement|undefined) {
    if (div == undefined) div = document.createElement('div')
    div.innerHTML = unit_data.name + '(id:' + unit_data.id + ')' + '<br>  hp: ' + unit_data.hp + '<br> ap: ' + unit_data.ap.toFixed(2)
    div.classList.add('fighter_' + unit_data.id)
    div.classList.add('enemy_status')
    div.onclick = () => BattleImage.select(unit_data.id)
    div.onmouseenter = () => BattleImage.set_hover(unit_data.id)
    div.onmouseleave = BattleImage.remove_hover
    return div
}

export const battle_canvas = document.getElementById('battle_canvas')! as HTMLCanvasElement
export const battle_canvas_context = battle_canvas.getContext('2d') as CanvasRenderingContext2D
export const canvas_background = document.getElementById('battle_canvas_background')! as HTMLCanvasElement



var bcp = false

battle_canvas.onmousedown = (event: any) => {
    event.preventDefault();
    bcp = true
}

battle_canvas.onmousemove = (event: any) => {
    let mouse_pos = get_mouse_pos_in_canvas(battle_canvas, event);
    BattleImage.hover(mouse_pos);
};

battle_canvas.onmouseup = (event: any) => {
    let mouse_pos = get_mouse_pos_in_canvas(battle_canvas, event);
    if (bcp) {
        BattleImage.press(mouse_pos);
        bcp = false;
    }
}

export const enemy_list_div = document.querySelector('.enemy_list')!

export const w = battle_canvas.width
export const h = battle_canvas.height

export let camera: canvas_position = {x: 0, y: 0} as canvas_position


let hovered: unit_id|undefined                  = undefined
let selected: unit_id|undefined                 = undefined
let current_turn: unit_id|undefined             = undefined
let anchor_position: canvas_position|undefined  = undefined
export let player_unit_id: unit_id|undefined                   = undefined
export let battle_in_progress                          = false

//temporary
export let  events_list: BattleImageEvent[]                  =[];
// let         units_data: {[_ in unit_id]: BattleUnit}         ={};
export let  units_views: {[_ in unit_id]: BattleUnitView}    ={};
let         unit_ids: Set<unit_id>                           =new Set();
let         anim_images: {[_ in unit_id]: AnimatedImage}     ={};
let         had_left: {[_ in unit_id]: boolean}              ={};
let         units_queue: unit_id[] = []

namespace UnitsQueueManagement {
    const width = 200
    const text_margin_top = 20
    const top = 20
    const left = 300
    const height = 50

    export function draw(canvas: CanvasRenderingContext2D) {
        canvas.fillStyle = 'rgb(0, 0, 0)'
        let last_index = 0
        for (let id of units_queue) {
            let unit = units_views[id]
            if (had_left[id]) continue
            if (unit == undefined) continue

            canvas.strokeRect(left + width * last_index, top, width, height)
            canvas.fillText(unit.name, left + width * last_index + 20, top + text_margin_top)
            if (player_unit_id == id) {
                canvas.fillText('YOU', left + width * last_index + 20, top + text_margin_top * 2)
            }

            canvas.fillText(unit.next_turn.toFixed(2), left + width * last_index + 100, top + text_margin_top)
            last_index += 1
        }
    }

    function swap_forward(i: number) {
        let unit = units_views[units_queue[i]]
        let next_unit = units_views[units_queue[i + 1]]
        if (unit == undefined) return
        if ((next_unit != undefined) && (next_unit.next_turn > unit.next_turn)) return
        if (next_unit != undefined) units_queue[i] = next_unit.id
        units_queue[i + 1] = unit.id
        return unit.next_turn
    }

    export function end_turn() {
        console.log('update units queue')
        if (units_queue.length <= 1) return
        for (let i = 0; i < units_queue.length - 1; i++) {
            let response = swap_forward(i)
            console.log(response)
        }
        console.log(units_queue)
    }

    export function new_unit(id: unit_id) {
        units_queue.unshift(id)
        end_turn()
    }

    export function clear() {
        units_queue = []
    }
}


//persistent
let    actions: battle_action[]                         =[]

let background_flag = false
let background = 'colony'

let tiles:(number|undefined)[] = []


const left = -7
const right = 7
const top = -15
const bottom = 15

const width = right - left 
const height = bottom - top
const max_dim = Math.max(width, height)

function x_y_to_tile(x: number, y: number) {
    return (x - left) * max_dim + y 
}

function set_tile(x: number, y: number, value: number) {
    const tile = x_y_to_tile(x, y)
    tiles[tile] = value
}

function get_tile(x: number, y: number) {
    const tile = x_y_to_tile(x, y)
    return tiles[tile]
}

const corners = [{x: left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}, {x: left, y: top}]

type f3 = [number, number, number]

function random(l: number, r: number) {
    return Math.random() * (r - l) + l
}

function generate_noise_vectors(n: number) {
    let vectors:f3[] = []
    for (let i = 0; i < n; i++) {
        vectors.push([random(left * 1.1, right * 1.1), random(top * 1.1, bottom * 1.1), random(-0.5, 0.5)])
    }
    return vectors
}

function dot3(a: f3, b: f3) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function dist(a: f3, b: f3) {
    const c: f3 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
    return Math.sqrt(dot3(c, c))
}

function calculate_noise(x: number, y: number, noise_vectors: f3[]) {
    const tile_vector: f3 = [x, y, 0]
    let noise = 0
    for (let vector of noise_vectors) {
        noise += 1 / (5 + dist(tile_vector, vector))
    }

    return noise
}

function generate_tiles() {
    const noise_vectors = generate_noise_vectors(10)
    console.log(noise_vectors)
    let max_noise = 0
    let min_noise = 9999
    for (let i = left; i < right; i++ ) {
        for (let j = top; j < bottom; j++) {
            const noise = calculate_noise(i, j, noise_vectors)
            if (noise > max_noise) {max_noise = noise}
            if (noise < min_noise) {min_noise = noise}
            set_tile(i, j, noise)
        }
    }

    for (let i = left; i < right; i++ ) {
        for (let j = top; j < bottom; j++) {
            let noise = get_tile(i, j)
            if (noise == undefined) continue
            set_tile(i, j, (noise - min_noise) / (max_noise - min_noise))
        }
    }
}

generate_tiles()
console.log('TILES')
console.log(tiles)

const tilemap = new Image()
tilemap.src = 'static/img/battle_tiles.png'

let key_to_action: {[_ in string]: string|undefined} = {}

function HOTKEYS_HANDLER(e: KeyboardEvent) {
    let action = key_to_action[e.key]
    if (action != undefined) {
        BattleImage.send_action(action)
    }
}

document.addEventListener('keyup', HOTKEYS_HANDLER, false);

export namespace BattleImage {
    export function load(data: BattleData) {
        console.log('load battle')
        console.log(data)
        reset()
        for (let [_, unit] of Object.entries(data)) {
            load_unit(unit)
        }
        socket.emit('req-player-index')
        socket.emit('req-flee-chance')
    }

    export function reset() {
        hovered = undefined
        selected = undefined
        current_turn = undefined
        anchor_position = undefined
        player_unit_id = undefined
        battle_in_progress = false

        enemy_list_div.innerHTML = ''

        events_list     =[];
        // units_data      ={};
        units_views     ={};
        unit_ids        =new Set();
        anim_images     ={};
        had_left        ={};

        UnitsQueueManagement.clear()
    }

    export function load_unit(unit: UnitSocket) {
        console.log('load unit')
        console.log(unit)
        console.log("add fighter")

        let unit_view = new BattleUnitView(unit)

        unit_ids.add(unit.id)
        // units_data[unit.id]     = battle_unit
        units_views[unit.id]    = unit_view

        anim_images[unit.id] = new AnimatedImage(unit.tag)

        let div = build_unit_div(unit_view, undefined)
        enemy_list_div.appendChild(div)

        UnitsQueueManagement.new_unit(unit.id)
    }

    export function update(dt: number) {
        let estimated_events_time = 0
        for (let event of events_list) {
            estimated_events_time += event.estimated_time_left()
        }
        let time_scale = 1
        if (estimated_events_time > 0.5) {
            time_scale = estimated_events_time / 0.5
        }

        const scaled_dt = dt * time_scale

        let current_event = events_list[0]
        if (current_event != undefined) {
            const responce = current_event.effect(scaled_dt)
            if (responce) {
                events_list = events_list.slice(1)
                update_selection_data()
                update_unit_div(current_event.unit)
            }
        }
    }

    export function new_event(event: BattleImageEvent) {
        events_list.push(event)
        events_list.sort((a, b) => {
            return (a.event_id - b.event_id)
        })
    }

    export function unit_div(id: unit_id|undefined): HTMLDivElement|undefined {
        if (id == undefined) return undefined;
        let div = enemy_list_div.querySelector('.fighter_' + id) 
        if (div == null) return undefined
        return div as HTMLDivElement
    }

    export function unload_unit(unit: UnitSocket) {
        unload_unit_by_id(unit.id)
    }

    export function unload_unit_by_id(unit: unit_id) {
        const div = unit_div(unit)
        if (div != undefined) div.parentElement?.removeChild(div)
        if (units_views[unit] != undefined) {
            units_views[unit].killed = true
        }
        
        had_left[unit] = true

        UnitsQueueManagement.end_turn()
    }

    function unselect() {
        let div = unit_div(selected)
        if (div != undefined) div.classList.remove('selected_unit')

        selected = undefined
        anchor_position = undefined
    }

    export function update_selection_data() {
        if (selected == undefined) return
        if (player_unit_id == undefined) {return}

        const player_data = units_views[player_unit_id]
        const target_data = units_views[selected]
        if (player_data == undefined) return
        if (target_data == undefined) return

        let a = player_data.position
        let b = target_data.position
        let dist = Math.floor(position_c.dist(a, b) * 100) / 100

        update_move_ap_cost(dist, player_data.move_cost)
        socket.emit('req-ranged-accuracy', dist)
    }

    export function select(index: unit_id) {
        unselect()

        selected = index;

        update_selection_data()

        let div = unit_div(index)
        if (div != undefined) div.classList.add('selected_unit')
    }

    function d2(a: [number, number], b: [number, number]) {
        return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
    }

    const selection_magnet = 400;

    export function hover(pos: canvas_position) {
        let hovered_flag = false;

        for (let unit_id of unit_ids) {
            // validate unit
            if (had_left[unit_id]) continue
            let unit_view = units_views[unit_id]
            if (unit_view == undefined) continue;
            if (unit_view.killed) continue;

            let centre = position_c.battle_to_canvas(unit_view.position, camera)
            if (d2([centre.x, centre.y], [pos.x, pos.y]) < selection_magnet) {
                hovered_flag = true;
                set_hover(Number(unit_id) as unit_id)
            }
        } 
        if (!hovered_flag) {
            remove_hover()
        }
    }

    export function set_hover(i: unit_id) {
        remove_hover()
        hovered = i;
        let div = enemy_list_div.querySelector('.fighter_' + i)
        if (div != undefined) div.classList.add('hovered_unit')
    }

    export function remove_hover() {
        if (hovered != undefined) {
            let div = enemy_list_div.querySelector('.fighter_' + hovered)
            if (div != undefined) div.classList.remove('hovered_unit')
        }
        hovered = undefined;
    }

    export function press(pos: canvas_position) {
        let selected = false;
        for (let i of unit_ids) {
            if (had_left[i]) continue
            let unit = units_views[i]
            if (unit == undefined) continue;
            if (unit.hp == 0) continue
            let centre = position_c.battle_to_canvas(unit.position, camera)
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                select(i)
                selected = true
            }
        } 
        if (!selected) {
            unselect()
            anchor_position = pos;

            if (player_unit_id != undefined) {
                const player_data = units_views[player_unit_id]
                if (player_data == undefined) return;
                let a = player_data.position
                let b = position_c.canvas_to_battle(anchor_position)
                let dist = Math.floor(position_c.dist(a, b) * 100) / 100
                update_move_ap_cost(dist, player_data.move_cost)
            } else {
                socket.emit('req-player-index')
                socket.emit('req-flee-chance')
            }
        }
    }

    function update_move_ap_cost(dist: number, move_cost: number) {
        let move_ap_div = document.getElementById('move'+'_ap_cost')!
        move_ap_div.innerHTML = 'ap: ' + (dist * move_cost).toFixed(2)
    }

    function change_bg(bg:string) {
        background = bg;
        let ctx = canvas_background.getContext('2d');
        ctx?.drawImage(IMAGES['battle_bg_' + background], 0, 0, w, h);
    }

    export function add_action(action_type:battle_action, hotkey: string) {
        actions.push(action_type)

        console.log(action_type)
        
        let action_div = document.createElement('div');
        action_div.classList.add('battle_action');
        action_div.classList.add(action_type.tag)
        action_div.id = "battle_action_" + action_type.tag
        
        {
            let label = document.createElement('div')
            label.innerHTML = `(${hotkey}) ${action_type.name}`
            action_div.appendChild(label)
        }

        {
            let label = document.createElement('div')
            label.id = action_type.tag + '_ap_cost'
            action_div.appendChild(label)
            
            if (action_type.cost != undefined) {
                label.innerHTML = 'ap: ' + action_type.cost;
            }
        }
        
        if (action_type.probabilistic) {
            let label = document.createElement('div')
            label.id = action_type.tag + '_chance_b'
            label.innerHTML = '???%'
            action_div.appendChild(label)
        }

        if (action_type.damaging) {
            let label = document.createElement('div')
            label.id = action_type.tag + '_damage_b'
            label.innerHTML = '???'
            action_div.appendChild(label)
        }
        
        key_to_action[hotkey] = action_type.tag
        action_div.onclick = () => send_action(action_type.tag)

        // action_divs[action_type.name] = action_div

        let div = document.querySelector('.battle_control')!;
        div.appendChild(action_div)
    }

    export function update_action_probability(tag:string, value:number) {
        console.log(tag, value)
        let label = document.getElementById(tag + '_chance_b')!
        label.innerHTML = Math.floor(value * 100) + '%'
    }

    export function update_action_damage(tag: string, value: number) {
        console.log(tag, value)
        let label = document.getElementById(tag + '_damage_b')!
        label.innerHTML = '~' + value.toString()
    }

    export function update_action_cost(tag: string, value: number) {
        console.log(tag, value)
        let label = document.getElementById(tag + '_ap_cost')!
        label.innerHTML = value.toString()
    }

    export function set_current_turn(index: unit_id, time_passed: number) {
        for (let unit of Object.values(units_views)) {
            unit.next_turn -= time_passed
        }

        console.log('new turn ' + index + ' ' + current_turn)
        const div_prev = unit_div(current_turn)
        if (div_prev != undefined) div_prev.classList.remove('current_turn')

        let div = unit_div(index)
        if (div != undefined) div.classList.add('current_turn');
        current_turn = index
    }

    export function send_action(tag:string) {
        console.log('send action ' + tag)
        if (tag.startsWith('spell')) {
            if (selected != undefined) {
                socket.emit('battle-action', {action: tag, target: selected})
            }
        } else if (tag == 'move') {
            if (anchor_position != undefined) {
                socket.emit('battle-action', {action: 'move', target: position_c.canvas_to_battle(anchor_position)})
            }
        } else if (tag.startsWith('attack')) {
            if (selected != undefined) {
                socket.emit('battle-action', {action: tag, target: selected})
            }
        } else if (tag == 'fast_attack') {
            if (selected != undefined) {
                socket.emit('battle-action', {action: 'fast_attack', target: selected})
            }
        } else if (tag == 'magic_bolt') {
            if (selected != undefined) {
                socket.emit('battle-action', {action: 'magic_bolt', target: selected})
            }
        } else if (tag == 'push_back') {
            if (selected != undefined) {
                socket.emit('battle-action', {action: 'push_back', target: selected})
            }
        } else if (tag == 'shoot') {
            if (selected != undefined) {
                socket.emit('battle-action', {action: 'shoot', target: selected})
            }
        }else if (tag == 'switch_weapon') {
            socket.emit('battle-action', {action: 'switch_weapon'})
        } else if (tag == 'flee') {
            socket.emit('battle-action', {action: 'flee'})
        } else if (tag == 'dodge') {
            socket.emit('battle-action', {action: 'dodge'})
        }else if (tag == 'end_turn') {
            socket.emit('battle-action', {action: 'end_turn'})
        }
    }

    export function set_player(unit_id: unit_id) {
        console.log('set_player_position')
        console.log(unit_id)
        player_unit_id = unit_id
        update_player_actions_availability()
    }

    export function update_player_actions_availability() {
        if (player_unit_id == undefined) {
            return
        }

        if (units_views[player_unit_id] == undefined) {
            return
        }

        let player = units_views[player_unit_id]
        if (player == undefined) return

        for (let i of actions) {
            let div = document.querySelector('.battle_control>.' + i.tag)
            if (div == undefined) continue;

            if ((i.cost != undefined) && (player.ap < i.cost)) {
                div.classList.add('disabled')
            } else {
                div.classList.remove('disabled')
            }
        } 
    }
    export function update_action_display(tag: string, flag: boolean) {
        console.log(tag)
        console.log(flag)
        let div = document.getElementById('battle_action_' + tag)!
        if (flag) {
            div.classList.remove('display_none')
        } else {
            div.classList.add('display_none')
        }
    }

    export function draw_background() {
        // tiles
        for (let i = left; i < right; i++) {
            for (let j = top; j < bottom; j++) {
                let start_point = position_c.battle_to_canvas({x: i, y: j + 1} as battle_position, camera)

                const colour = get_tile(i, j)
                if (colour == undefined) continue
                const rgba = `rgba(${Math.floor(colour * 255)}, 0, 0, 1)`
                // battle_canvas_context.fillStyle = rgba
                // battle_canvas_context.fillRect(start_point.x, start_point.y, BATTLE_SCALE, BATTLE_SCALE)
                let tile = 0
                if ((colour > 0.7) || (colour < 0.2)) {
                    tile = 1
                }

                battle_canvas_context.drawImage(
                    tilemap, 
                    tile * 50, 0,
                    50, 50,
                    start_point.x, start_point.y,
                    BATTLE_SCALE, BATTLE_SCALE
                )

                // battle_canvas_context.fillRect((i + 20) * 10 + 30, (j + 20) * 10 + 30, 10, 10)
            }
        }

        // grid
        battle_canvas_context.strokeStyle = 'rgba(0, 0, 0, 1)';
        battle_canvas_context.beginPath();
        battle_canvas_context.setLineDash([]);
        const c1 = position_c.battle_to_canvas(corners[0] as battle_position, camera)
        battle_canvas_context.moveTo(c1.x, c1.y);
        for (let c of corners) {
            const next = position_c.battle_to_canvas(c as battle_position, camera)
            battle_canvas_context.lineTo(next.x, next.y)
        }
        battle_canvas_context.stroke()

        // battle_canvas_context.beginPath();
        // battle_canvas_context.setLineDash([3, 15]);
        // for (let i = left + 1; i < right; i++) {
        //     const start_point = position_c.battle_to_canvas({x: i, y: top} as battle_position)
        //     const end_point = position_c.battle_to_canvas({x: i, y: bottom} as battle_position)
        //     battle_canvas_context.moveTo(start_point.x, start_point.y);
        //     battle_canvas_context.lineTo(end_point.x, end_point.y)
        // }
        
        // for (let i = top + 1; i < bottom; i++) {
        //     const start_point = position_c.battle_to_canvas({x: left, y: i} as battle_position)
        //     const end_point = position_c.battle_to_canvas({x: right, y: i} as battle_position)
        //     battle_canvas_context.moveTo(start_point.x, start_point.y);
        //     battle_canvas_context.lineTo(end_point.x, end_point.y)
        // }
        // battle_canvas_context.stroke()
        
    }

    export function draw_units(dt: number) {
        //sort views by y coordinate
        var draw_order = Array.from(unit_ids)

        draw_order.sort((a, b) => {
            const A = units_views[a]
            const B = units_views[b]
            if (A == undefined) return 0
            if (B == undefined) return 0
            return (-A.position.y + B.position.y)
        })

        //draw views
        for (let unit_id of draw_order) {
            if (had_left[unit_id]) continue
            let view = units_views[Number(unit_id) as unit_id]
            if (view == undefined) continue
            if (view.hp == 0) continue
            view.draw(dt, camera, selected, hovered, player_unit_id, current_turn)
        }
    }

    export function draw(dt: number) {
        battle_canvas_context.clearRect(0, 0, w, h);
        draw_background()
        
        UnitsQueueManagement.draw(battle_canvas_context)
        //handle_events
        update(dt)       

        // draw background only once (no camera movement support yet)
        if (!background_flag){
            let ctx = canvas_background.getContext('2d');
            ctx?.drawImage(IMAGES['battle_bg_' + background], 0, 0, w, h);
            background_flag = true;
        } 

         
        draw_units(dt)
        draw_anchor()
    }

    export function draw_anchor() {
        let ctx = battle_canvas_context
        if (anchor_position != undefined) {            
            ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
            ctx.fillStyle = "rgba(10, 10, 200, 0.9)";
            ctx.beginPath();
            ctx.arc(anchor_position.x, anchor_position.y, BATTLE_SCALE/10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';

            if (player_unit_id != undefined) {
                let player = units_views[player_unit_id]
                if (player == undefined) return
                let centre = position_c.battle_to_canvas(player.position, camera);

                ctx.beginPath()
                ctx.moveTo(centre.x, centre.y);
                ctx.lineTo(anchor_position.x, anchor_position.y)
                ctx.stroke()
            }
        }

        if ((selected != undefined) && (player_unit_id != undefined)) {
            let player = units_views[player_unit_id]
            let target = units_views[selected]
            if (player == undefined) return
            if (target == undefined) return

            let centre1 = position_c.battle_to_canvas(player.position, camera);
            let centre2 = position_c.battle_to_canvas(target.position, camera);

            ctx.beginPath()
            ctx.moveTo(centre1.x, centre1.y);
            ctx.lineTo(centre2.x, centre2.y)
            ctx.stroke()
        }
    }

    export function update_unit_displays(unit: unit_id) {
        BattleImage.update_unit_div(unit)
        UnitsQueueManagement.end_turn()
    }

    export function update_unit_div(unit: unit_id) {
        let div = unit_div(unit)
        if (div == undefined) return
        const unit_view = units_views[unit]
        if (unit_view.hp == 0) {
            div.style.display = "none"
        } else {
            build_unit_div(units_views[unit], div)
        }
    }
}


// export class BattleImageNext {
//     remove_fighter(unit_id: unit_id) {
//         console.log("remove fighter")
//         console.log(unit_id)

//         const div = document.querySelectorAll('.fighter_' + unit_id)[0]
//         if (div != undefined) {
//             div.parentElement?.removeChild(div)
//         }

//         had_left[unit_id] = true
//     }



//     update_unit(unit: UnitSocket) {
//         console.log('update')
//         console.log(unit)

//         let event = new UpdateDataEvent(unit.id, unit)
//         events_list.push(event)
//     }

//     update(data: BattleData) {
//         console.log('battle update')
//         console.log(data)
//         for (let unit of Object.values(data)) {
//             if (had_left[unit.id]) continue

//             update_unit(unit)            
//         }

        
//         if (selected == undefined) return
//         if (player == undefined) return
//         let move_ap_div = document.getElementById('move'+'_ap_cost')!

//         const player_data = units_data[player]
//         const target_data = units_data[selected]
//         if (player_data == undefined) return
//         if (target_data == undefined) return
        
//         let a = player_data.position
//         let b = target_data.position
//         let dist = Math.floor(position_c.dist(a, b) * 100) / 100
//         move_ap_div.innerHTML = 'ap: ' + dist * 3
//         socket.emit('req-ranged-accuracy', dist)
//     }








//     clear() {
//         let event = new ClearBattleEvent
//         events_list.push(event)
//     }







//     handle_socket_data(action: any){
//         // handle immediate responces
//         if ((action.action == 'not_enough_ap')) {
//             if (action.who == player) {
//                 alert('Not enough action points')
//                 return 'Not enough action points'
//             }            
//             return 'ok'
//         }
//         if ((action.action == 'not_your_turn') ){
//             if (action.who == player) {
//                 alert('Not your turn')
//                 return 'not_your_turn'
//             }
//             return 'ok'
//         }
//         if ((action.action == 'not_learnt') ){
//             if (action.who == player) {
//                 alert('This action is not learnt')
//                 return 'not_learnt'
//             }
//             return 'ok'
//         }
//         if (action.action.startsWith('stop_battle')) {
//             return 'battle has ended'
//         }
//     }
// }
    

    // returns log message
    // returns null if no message needed
    // battle_action(data) {
    //     if (data == null) {
    //         return ''
    //     }
    //     update_action(data)
    //     console.log('battle action data')
    //     console.log(data)
    //     if (data.action == 'end_turn') {
    //         return 'end_of_the_turn'
    //     }
        
    //     if (data.action == 'pff') {
    //         return 'something wrong has happened'
    //     }
        
    //     else 
    //     } else if (data.action.startsWith('flee-failed')) {
    //         return names[data.who] + ' failed to retreat'
    //     }

    //     return 'untreated case of battle action !!!!' + data.action
    // }
