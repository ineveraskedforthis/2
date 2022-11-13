import { AnimatedImage, BattleUnit, BATTLE_SCALE, ClearBattleEvent, draw_image, position_c, UpdateDataEvent } from './battle_image_helper.js';
import { BattleUnitView } from './battle_view.js';
function new_log_message(msg) {
    if (msg == null) {
        return;
    }
    if (msg == 'ok')
        return;
    var log = document.getElementById('log');
    var new_line = document.createElement('p');
    var text = document.createTextNode(msg);
    new_line.append(text);
    log.appendChild(new_line);
    log.scrollTop = log.scrollHeight;
}
function build_character_div(unit_data, battle_data) {
    let div = document.createElement('div');
    div.innerHTML = 'hp: ' + unit_data.hp + '<br> ap: ' + unit_data.ap;
    div.classList.add('fighter_' + unit_data.id);
    div.classList.add('enemy_status');
    div.onclick = () => battle_data.set_selection(unit_data.id);
    div.onmouseenter = () => battle_data.set_hover(unit_data.id);
    div.onmouseleave = battle_data.remove_hover;
    return div;
}
export class BattleImageNext {
    constructor(canvas, canvas_background) {
        this.canvas = canvas;
        this.canvas_background = canvas_background;
        this.canvas_context = canvas.getContext('2d');
        this.container = document.getElementById('battle_tab');
        this.background = "colony";
        this.background_flag = false;
        this.hovered = undefined;
        this.w = canvas.width;
        this.h = canvas.height;
        this.scale = 1;
        this.events_list = [];
        this.units_data = {};
        this.units_views = {};
        this.unit_ids = new Set();
        this.images = {};
        this.had_left = {};
        this.actions = [];
        this.in_progress = false;
        this.reset_data();
    }
    reset_data() {
        this.canvas_context.clearRect(0, 0, this.w, this.h);
        this.events_list = [];
        this.units_data = {};
        this.units_views = {};
        this.selected = undefined;
        this.hovered = undefined;
        this.anchor = undefined;
        this.current_turn = undefined;
        this.unit_ids = new Set();
        {
            let div = this.container.querySelector('.enemy_list');
            div.innerHTML = '';
        }
    }
    // load(data: BattleData) {
    //     console.log('load battle')
    //     this.in_progress = true
    //     this.reset_data()
    //     for (var i in data) {
    //         this.add_fighter(Number(i) as unit_id, data[i].tag, data[i].position as battle_position, data[i].range, data[i].name, data[i].hp, data[i].ap)
    //     }
    // }
    add_fighter(unit_id, tag, pos, range, name, hp, max_hp, ap) {
        console.log("add fighter");
        console.log(unit_id, tag, pos, range, name);
        let unit = new BattleUnit(unit_id, name, hp, max_hp, ap, range, pos, tag);
        let unit_view = new BattleUnitView(unit);
        this.unit_ids.add(unit_id);
        this.units_data[unit_id] = unit;
        this.units_views[unit_id] = unit_view;
        this.images[unit_id] = new AnimatedImage(tag);
        let div = build_character_div(unit, this);
        this.container.querySelector(".enemy_list").appendChild(div);
    }
    remove_fighter(unit_id) {
        console.log("remove fighter");
        console.log(unit_id);
        const div = document.querySelectorAll('.fighter_' + unit_id)[0];
        if (div != undefined) {
            div.parentElement?.removeChild(div);
        }
        this.had_left[unit_id] = true;
    }
    change_bg(bg) {
        this.background = bg;
        let ctx = this.canvas_background.getContext('2d');
        draw_image(ctx, images['battle_bg_' + this.background], 0, 0, this.w, this.h);
        this.background_flag = true;
    }
    update_unit(unit) {
        console.log('update');
        console.log(unit.id + ' ' + unit.name + 'ap: ' + unit.ap);
        let event = new UpdateDataEvent(unit.id, unit);
        this.events_list.push(event);
    }
    update(data) {
        for (let unit of Object.values(data)) {
            if (this.had_left[unit.id])
                continue;
            this.update_unit(unit);
        }
        if (this.selected == undefined)
            return;
        if (this.player_id == undefined)
            return;
        let move_ap_div = document.getElementById('move' + '_ap_cost');
        const player_data = this.units_data[this.player_id];
        const target_data = this.units_data[this.selected];
        if (player_data == undefined)
            return;
        if (target_data == undefined)
            return;
        let a = player_data.position;
        let b = target_data.position;
        let dist = Math.floor(position_c.dist(a, b) * 100) / 100;
        move_ap_div.innerHTML = 'ap: ' + dist * 3;
        this.socket.emit('req-ranged-accuracy', dist);
    }
    set_player(unit_id) {
        console.log('set_player_position');
        console.log(unit_id);
        this.player_id = unit_id;
        this.update_player_actions_availability();
    }
    update_action_display(tag, flag) {
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
    update_player_actions_availability() {
        if (this.player_id == undefined) {
            return;
        }
        if (this.units_data[this.player_id] == undefined) {
            return;
        }
        let player = this.units_data[this.player_id];
        if (player == undefined)
            return;
        for (let i of this.actions) {
            let div = this.container.querySelector('.battle_control>.' + i.tag);
            if ((i.cost != undefined) && (player.ap < i.cost)) {
                div.classList.add('disabled');
            }
            else {
                div.classList.remove('disabled');
            }
        }
    }
    hover(pos) {
        let hovered = false;
        for (let unit_id of this.unit_ids) {
            if (this.had_left[unit_id])
                continue;
            let unit_view = this.units_views[unit_id];
            if (unit_view == undefined)
                continue;
            let centre = position_c.battle_to_canvas(unit_view.position, this.h, this.w);
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                hovered = true;
                this.set_hover(Number(unit_id));
            }
        }
        if (!hovered) {
            this.remove_hover();
        }
    }
    set_hover(i) {
        if (this.hovered != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.hovered);
            div.classList.remove('hovered_unit');
        }
        this.hovered = i;
        let div = this.container.querySelector('.enemy_list > .fighter_' + i);
        div.classList.add('hovered_unit');
    }
    remove_hover() {
        if (this.hovered != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.hovered);
            div.classList.remove('hovered_unit');
        }
        this.hovered = undefined;
    }
    clear() {
        let event = new ClearBattleEvent;
        this.events_list.push(event);
    }
    draw(images, dt) {
        //handle_events
        for (let event of this.events_list) {
            event.effect(this);
            let log_entry = event.generate_log_message(this);
            new_log_message(log_entry);
        }
        this.events_list = [];
        this.canvas_context.clearRect(0, 0, this.w, this.h);
        // draw background only once (no camera movement support yet)
        if (!this.background_flag) {
            let ctx = this.canvas_background.getContext('2d');
            draw_image(ctx, images['battle_bg_' + this.background], 0, 0, this.w, this.h);
            this.background_flag = true;
        }
        //sort views by y coordinate
        var draw_order = Array.from(this.unit_ids);
        draw_order.sort((a, b) => {
            const A = this.units_views[a];
            const B = this.units_views[b];
            if (A == undefined)
                return 0;
            if (B == undefined)
                return 0;
            return (-A.position.y + B.position.y);
        });
        //draw views
        for (let unit_id of draw_order) {
            if (this.had_left[unit_id])
                continue;
            let view = this.units_views[Number(unit_id)];
            if (view == undefined)
                continue;
            view.draw(dt, this, images);
        }
        this.draw_anchor();
    }
    draw_anchor() {
        if (this.anchor != undefined) {
            let ctx = this.canvas.getContext('2d');
            ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
            ctx.fillStyle = "rgba(10, 10, 200, 0.9)";
            ctx.beginPath();
            ctx.arc(this.anchor.x, this.anchor.y, BATTLE_SCALE / 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
            if (this.player_id != undefined) {
                let player = this.units_views[this.player_id];
                if (player == undefined)
                    return;
                let centre = position_c.battle_to_canvas(player.position, this.h, this.w);
                ctx.beginPath();
                ctx.moveTo(centre.x, centre.y);
                ctx.lineTo(this.anchor.x, this.anchor.y);
                ctx.stroke();
            }
        }
        if ((this.selected != undefined) && (this.player_id != undefined)) {
            let player = this.units_views[this.player_id];
            let target = this.units_views[this.selected];
            if (player == undefined)
                return;
            if (target == undefined)
                return;
            let centre1 = position_c.battle_to_canvas(player.position, this.h, this.w);
            let centre2 = position_c.battle_to_canvas(target.position, this.h, this.w);
            this.canvas_context.beginPath();
            this.canvas_context.moveTo(centre1.x, centre1.y);
            this.canvas_context.lineTo(centre2.x, centre2.y);
            this.canvas_context.stroke();
        }
    }
    set_selection(index) {
        if (this.selected != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.selected);
            div.classList.remove('selected_unit');
        }
        this.selected = index;
        this.anchor = undefined;
        if (this.player_id != undefined) {
            let move_ap_div = document.getElementById('move' + '_ap_cost');
            const player_data = this.units_data[this.player_id];
            const target_data = this.units_data[this.selected];
            if (player_data == undefined)
                return;
            if (target_data == undefined)
                return;
            let a = player_data.position;
            let b = target_data.position;
            let dist = Math.floor(position_c.dist(a, b) * 100) / 100;
            move_ap_div.innerHTML = 'ap: ' + dist * 3;
            this.socket.emit('req-ranged-accuracy', dist);
        }
        let div = this.container.querySelector('.enemy_list > .fighter_' + index);
        div.classList.add('selected_unit');
    }
    remove_selection() {
        if (this.selected != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.selected);
            div?.classList.remove('selected_unit');
        }
        this.selected = undefined;
    }
    press(pos) {
        let selected = false;
        for (let i of this.unit_ids) {
            if (this.had_left[i])
                continue;
            let unit = this.units_views[i];
            if (unit == undefined)
                continue;
            let centre = position_c.battle_to_canvas(unit.position, this.h, this.w);
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                this.set_selection(i);
                selected = true;
            }
        }
        if (!selected) {
            this.remove_selection();
            this.anchor = pos;
            if (this.player_id != undefined) {
                let move_ap_div = document.getElementById('move' + '_ap_cost');
                const player_data = this.units_data[this.player_id];
                if (player_data == undefined)
                    return;
                let a = player_data.position;
                let b = position_c.canvas_to_battle(this.anchor, this.h, this.w);
                let dist = Math.floor(position_c.dist(a, b) * 100) / 100;
                move_ap_div.innerHTML = 'ap: ' + dist * 3;
            }
        }
    }
    send_action(tag) {
        console.log('send action ' + tag);
        if (tag.startsWith('spell')) {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', { action: tag, target: this.selected });
            }
        }
        else if (tag == 'move') {
            if (this.anchor != undefined) {
                this.socket.emit('battle-action', { action: 'move', target: position_c.canvas_to_battle(this.anchor, this.h, this.w) });
            }
        }
        else if (tag.startsWith('attack')) {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', { action: tag, target: this.selected });
            }
        }
        else if (tag == 'fast_attack') {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', { action: 'fast_attack', target: this.selected });
            }
        }
        else if (tag == 'magic_bolt') {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', { action: 'magic_bolt', target: this.selected });
            }
        }
        else if (tag == 'push_back') {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', { action: 'push_back', target: this.selected });
            }
        }
        else if (tag == 'shoot') {
            if (this.selected != undefined) {
                this.socket.emit('battle-action', { action: 'shoot', target: this.selected });
            }
        }
        else if (tag == 'switch_weapon') {
            this.socket.emit('battle-action', { action: 'switch_weapon' });
        }
        else if (tag == 'flee') {
            this.socket.emit('battle-action', { action: 'flee' });
        }
        else if (tag == 'dodge') {
            this.socket.emit('battle-action', { action: 'dodge' });
        }
        else if (tag == 'end_turn') {
            this.socket.emit('battle-action', { action: 'end_turn' });
        }
    }
    add_action(action_type) {
        this.actions.push(action_type);
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
        action_div.onclick = () => this.send_action(action_type.tag);
        // this.action_divs[action_type.name] = action_div
        let div = this.container.querySelector('.battle_control');
        div.appendChild(action_div);
    }
    update_action_probability(tag, value) {
        console.log(tag, value);
        let label = document.getElementById(tag + '_chance_b');
        label.innerHTML = Math.floor(value * 100) + '%';
    }
    set_current_turn(index) {
        console.log('new turn ' + index + ' ' + this.current_turn);
        if (this.current_turn != undefined) {
            let div = this.container.querySelector('.enemy_list > .fighter_' + this.current_turn);
            div.classList.remove('current_turn');
        }
        let div = this.container.querySelector('.enemy_list > .fighter_' + index);
        if (div != null)
            div.classList.add('current_turn');
        this.current_turn = index;
    }
    handle_socket_data(action) {
        // handle immediate responces
        if ((action.action == 'not_enough_ap')) {
            if (action.who == this.player_id) {
                alert('Not enough action points');
                return 'Not enough action points';
            }
            return 'ok';
        }
        if ((action.action == 'not_your_turn')) {
            if (action.who == this.player_id) {
                alert('Not your turn');
                return 'not_your_turn';
            }
            return 'ok';
        }
        if ((action.action == 'not_learnt')) {
            if (action.who == this.player_id) {
                alert('This action is not learnt');
                return 'not_learnt';
            }
            return 'ok';
        }
        if (action.action.startsWith('stop_battle')) {
            return 'battle has ended';
        }
    }
}
// returns log message
// returns null if no message needed
// battle_action(data) {
//     if (data == null) {
//         return ''
//     }
//     this.update_action(data)
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
//         return this.names[data.who] + ' failed to retreat'
//     }
//     return 'untreated case of battle action !!!!' + data.action
// }
