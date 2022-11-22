import { BattleUnit, get_mouse_pos_in_canvas, position_c } from './battle_image_helper.js';
import { BattleUnitView } from './battle_view.js';
import { socket } from '../globals.js';
import { AnimatedImage } from './animation.js';
import { BATTLE_SCALE } from './constants.js';
import { IMAGES } from '../load_images.js';
function build_unit_div(unit_data) {
    let div = document.createElement('div');
    div.innerHTML = unit_data.name + '(id:' + unit_data.id + ')' + '<br>  hp: ' + unit_data.hp + '<br> ap: ' + unit_data.ap;
    div.classList.add('fighter_' + unit_data.id);
    div.classList.add('enemy_status');
    div.onclick = () => BattleImage.select(unit_data.id);
    div.onmouseenter = () => BattleImage.set_hover(unit_data.id);
    div.onmouseleave = BattleImage.remove_hover;
    return div;
}
export const battle_canvas = document.getElementById('battle_canvas');
export const battle_canvas_context = battle_canvas.getContext('2d');
export const canvas_background = document.getElementById('battle_canvas_background');
var bcp = false;
battle_canvas.onmousedown = (event) => {
    event.preventDefault();
    bcp = true;
};
battle_canvas.onmousemove = (event) => {
    let mouse_pos = get_mouse_pos_in_canvas(battle_canvas, event);
    BattleImage.hover(mouse_pos);
};
battle_canvas.onmouseup = (event) => {
    let mouse_pos = get_mouse_pos_in_canvas(battle_canvas, event);
    if (bcp) {
        BattleImage.press(mouse_pos);
        bcp = false;
    }
};
export const enemy_list_div = document.querySelector('.enemy_list');
export const w = battle_canvas.width;
export const h = battle_canvas.height;
let hovered = undefined;
let selected = undefined;
let current_turn = undefined;
let anchor_position = undefined;
export let player_unit_id = undefined;
export let battle_in_progress = false;
//temporary
export let events_list = [];
let units_data = {};
export let units_views = {};
let unit_ids = new Set();
let anim_images = {};
let had_left = {};
//persistent
let actions = [];
let background_flag = false;
let background = 'colony';
export var BattleImage;
(function (BattleImage) {
    function load(data) {
        reset();
        for (let [_, unit] of Object.entries(data)) {
            load_unit(unit);
        }
    }
    BattleImage.load = load;
    function reset() {
        hovered = undefined;
        selected = undefined;
        current_turn = undefined;
        anchor_position = undefined;
        player_unit_id = undefined;
        battle_in_progress = false;
        enemy_list_div.innerHTML = '';
        events_list = [];
        units_data = {};
        units_views = {};
        unit_ids = new Set();
        anim_images = {};
        had_left = {};
    }
    BattleImage.reset = reset;
    function load_unit(unit) {
        console.log('load unit');
        console.log("add fighter");
        let battle_unit = new BattleUnit(unit);
        let unit_view = new BattleUnitView(battle_unit);
        unit_ids.add(unit.id);
        units_data[unit.id] = battle_unit;
        units_views[unit.id] = unit_view;
        anim_images[unit.id] = new AnimatedImage(unit.tag);
        let div = build_unit_div(battle_unit);
        enemy_list_div.appendChild(div);
    }
    BattleImage.load_unit = load_unit;
    function update(dt) {
        let estimated_events_time = 0;
        for (let event of events_list) {
            estimated_events_time += event.estimated_time_left();
        }
        let time_scale = 1;
        if (estimated_events_time > 3) {
            time_scale = estimated_events_time / 3;
        }
        const scaled_dt = dt * time_scale;
        let current_event = events_list[0];
        if (current_event != undefined) {
            const responce = current_event.effect(scaled_dt);
            if (responce) {
                events_list = events_list.slice(1);
            }
            current_event.ap_change_left;
        }
    }
    BattleImage.update = update;
    function new_event(event) {
        events_list.push(event);
        events_list.sort((a, b) => {
            return (a.event_id - b.event_id);
        });
    }
    BattleImage.new_event = new_event;
    function unit_div(id) {
        if (id == undefined)
            return undefined;
        let div = enemy_list_div.querySelector('.fighter_' + id);
        if (div == null)
            return undefined;
        return div;
    }
    BattleImage.unit_div = unit_div;
    function unload_unit(unit) {
        const div = unit_div(unit.id);
        if (div != undefined)
            div.parentElement?.removeChild(div);
        units_views[unit.id].killed = true;
        had_left[unit.id] = true;
    }
    BattleImage.unload_unit = unload_unit;
    function unselect() {
        let div = unit_div(selected);
        if (div != undefined)
            div.classList.remove('selected_unit');
        selected = undefined;
        anchor_position = undefined;
    }
    function select(index) {
        unselect();
        selected = index;
        if (player_unit_id != undefined) {
            let move_ap_div = document.getElementById('move' + '_ap_cost');
            const player_data = units_data[player_unit_id];
            const target_data = units_data[selected];
            if (player_data == undefined)
                return;
            if (target_data == undefined)
                return;
            let a = player_data.position;
            let b = target_data.position;
            let dist = Math.floor(position_c.dist(a, b) * 100) / 100;
            move_ap_div.innerHTML = 'ap: ' + dist * 3;
            socket.emit('req-ranged-accuracy', dist);
        }
        let div = unit_div(index);
        if (div != undefined)
            div.classList.add('selected_unit');
    }
    BattleImage.select = select;
    function d2(a, b) {
        return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
    }
    const selection_magnet = 400;
    function hover(pos) {
        let hovered_flag = false;
        for (let unit_id of unit_ids) {
            // validate unit
            if (had_left[unit_id])
                continue;
            let unit_view = units_views[unit_id];
            if (unit_view == undefined)
                continue;
            if (unit_view.killed)
                continue;
            let centre = position_c.battle_to_canvas(unit_view.position);
            if (d2([centre.x, centre.y], [pos.x, pos.y]) < selection_magnet) {
                hovered_flag = true;
                set_hover(Number(unit_id));
            }
        }
        if (!hovered_flag) {
            remove_hover();
        }
    }
    BattleImage.hover = hover;
    function set_hover(i) {
        remove_hover();
        hovered = i;
        let div = enemy_list_div.querySelector('.fighter_' + i);
        if (div != undefined)
            div.classList.add('hovered_unit');
    }
    BattleImage.set_hover = set_hover;
    function remove_hover() {
        if (hovered != undefined) {
            let div = enemy_list_div.querySelector('.fighter_' + hovered);
            if (div != undefined)
                div.classList.remove('hovered_unit');
        }
        hovered = undefined;
    }
    BattleImage.remove_hover = remove_hover;
    function press(pos) {
        let selected = false;
        for (let i of unit_ids) {
            if (had_left[i])
                continue;
            let unit = units_views[i];
            if (unit == undefined)
                continue;
            let centre = position_c.battle_to_canvas(unit.position);
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                select(i);
                selected = true;
            }
        }
        if (!selected) {
            unselect();
            anchor_position = pos;
            if (player_unit_id != undefined) {
                let move_ap_div = document.getElementById('move' + '_ap_cost');
                const player_data = units_data[player_unit_id];
                if (player_data == undefined)
                    return;
                let a = player_data.position;
                let b = position_c.canvas_to_battle(anchor_position);
                let dist = Math.floor(position_c.dist(a, b) * 100) / 100;
                move_ap_div.innerHTML = 'ap: ' + dist * 3;
            }
        }
    }
    BattleImage.press = press;
    function change_bg(bg) {
        background = bg;
        let ctx = canvas_background.getContext('2d');
        ctx?.drawImage(IMAGES['battle_bg_' + background], 0, 0, w, h);
    }
    function add_action(action_type) {
        actions.push(action_type);
        console.log(action_type);
        let action_div = document.createElement('div');
        action_div.classList.add('battle_action');
        action_div.classList.add(action_type.tag);
        action_div.id = "battle_action_" + action_type.tag;
        {
            let label = document.createElement('div');
            label.innerHTML = action_type.name;
            action_div.appendChild(label);
        }
        {
            let label = document.createElement('div');
            label.id = action_type.tag + '_ap_cost';
            action_div.appendChild(label);
            if (action_type.cost != undefined) {
                label.innerHTML = 'ap: ' + action_type.cost;
            }
        }
        {
            let label = document.createElement('div');
            label.id = action_type.tag + '_chance_b';
            label.innerHTML = '???%';
            action_div.appendChild(label);
        }
        action_div.onclick = () => send_action(action_type.tag);
        // action_divs[action_type.name] = action_div
        let div = document.querySelector('.battle_control');
        div.appendChild(action_div);
    }
    BattleImage.add_action = add_action;
    function update_action_probability(tag, value) {
        console.log(tag, value);
        let label = document.getElementById(tag + '_chance_b');
        label.innerHTML = Math.floor(value * 100) + '%';
    }
    BattleImage.update_action_probability = update_action_probability;
    function set_current_turn(index) {
        console.log('new turn ' + index + ' ' + current_turn);
        const div_prev = unit_div(current_turn);
        if (div_prev != undefined)
            div_prev.classList.remove('current_turn');
        let div = unit_div(index);
        if (div != undefined)
            div.classList.add('current_turn');
        current_turn = index;
    }
    BattleImage.set_current_turn = set_current_turn;
    function send_action(tag) {
        console.log('send action ' + tag);
        if (tag.startsWith('spell')) {
            if (selected != undefined) {
                socket.emit('battle-action', { action: tag, target: selected });
            }
        }
        else if (tag == 'move') {
            if (anchor_position != undefined) {
                socket.emit('battle-action', { action: 'move', target: position_c.canvas_to_battle(anchor_position) });
            }
        }
        else if (tag.startsWith('attack')) {
            if (selected != undefined) {
                socket.emit('battle-action', { action: tag, target: selected });
            }
        }
        else if (tag == 'fast_attack') {
            if (selected != undefined) {
                socket.emit('battle-action', { action: 'fast_attack', target: selected });
            }
        }
        else if (tag == 'magic_bolt') {
            if (selected != undefined) {
                socket.emit('battle-action', { action: 'magic_bolt', target: selected });
            }
        }
        else if (tag == 'push_back') {
            if (selected != undefined) {
                socket.emit('battle-action', { action: 'push_back', target: selected });
            }
        }
        else if (tag == 'shoot') {
            if (selected != undefined) {
                socket.emit('battle-action', { action: 'shoot', target: selected });
            }
        }
        else if (tag == 'switch_weapon') {
            socket.emit('battle-action', { action: 'switch_weapon' });
        }
        else if (tag == 'flee') {
            socket.emit('battle-action', { action: 'flee' });
        }
        else if (tag == 'dodge') {
            socket.emit('battle-action', { action: 'dodge' });
        }
        else if (tag == 'end_turn') {
            socket.emit('battle-action', { action: 'end_turn' });
        }
    }
    function set_player(unit_id) {
        console.log('set_player_position');
        console.log(unit_id);
        player_unit_id = unit_id;
        update_player_actions_availability();
    }
    BattleImage.set_player = set_player;
    function update_player_actions_availability() {
        if (player_unit_id == undefined) {
            return;
        }
        if (units_data[player_unit_id] == undefined) {
            return;
        }
        let player = units_data[player_unit_id];
        if (player == undefined)
            return;
        for (let i of actions) {
            let div = document.querySelector('.battle_control>.' + i.tag);
            if (div == undefined)
                continue;
            if ((i.cost != undefined) && (player.ap < i.cost)) {
                div.classList.add('disabled');
            }
            else {
                div.classList.remove('disabled');
            }
        }
    }
    BattleImage.update_player_actions_availability = update_player_actions_availability;
    function update_action_display(tag, flag) {
        console.log(tag);
        console.log(flag);
        let div = document.getElementById('battle_action_' + tag);
        if (flag) {
            div.classList.remove('display_none');
        }
        else {
            div.classList.add('display_none');
        }
    }
    BattleImage.update_action_display = update_action_display;
    function draw(dt) {
        //handle_events
        update(dt);
        battle_canvas_context.clearRect(0, 0, w, h);
        // draw background only once (no camera movement support yet)
        if (!background_flag) {
            let ctx = canvas_background.getContext('2d');
            ctx?.drawImage(IMAGES['battle_bg_' + background], 0, 0, w, h);
            background_flag = true;
        }
        //sort views by y coordinate
        var draw_order = Array.from(unit_ids);
        draw_order.sort((a, b) => {
            const A = units_views[a];
            const B = units_views[b];
            if (A == undefined)
                return 0;
            if (B == undefined)
                return 0;
            return (-A.position.y + B.position.y);
        });
        //draw views
        for (let unit_id of draw_order) {
            if (had_left[unit_id])
                continue;
            let view = units_views[Number(unit_id)];
            if (view == undefined)
                continue;
            view.draw(dt, selected, hovered, player_unit_id);
        }
        draw_anchor();
    }
    BattleImage.draw = draw;
    function draw_anchor() {
        let ctx = battle_canvas_context;
        if (anchor_position != undefined) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
            ctx.fillStyle = "rgba(10, 10, 200, 0.9)";
            ctx.beginPath();
            ctx.arc(anchor_position.x, anchor_position.y, BATTLE_SCALE / 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
            if (player_unit_id != undefined) {
                let player = units_views[player_unit_id];
                if (player == undefined)
                    return;
                let centre = position_c.battle_to_canvas(player.position);
                ctx.beginPath();
                ctx.moveTo(centre.x, centre.y);
                ctx.lineTo(anchor_position.x, anchor_position.y);
                ctx.stroke();
            }
        }
        if ((selected != undefined) && (player_unit_id != undefined)) {
            let player = units_views[player_unit_id];
            let target = units_views[selected];
            if (player == undefined)
                return;
            if (target == undefined)
                return;
            let centre1 = position_c.battle_to_canvas(player.position);
            let centre2 = position_c.battle_to_canvas(target.position);
            ctx.beginPath();
            ctx.moveTo(centre1.x, centre1.y);
            ctx.lineTo(centre2.x, centre2.y);
            ctx.stroke();
        }
    }
    BattleImage.draw_anchor = draw_anchor;
})(BattleImage || (BattleImage = {}));
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
