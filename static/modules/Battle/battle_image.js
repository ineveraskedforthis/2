import { socket } from "../Socket/socket.js";
import { BattleView } from './View/battle_view.js';
import { BattleStorage, fatten_battle_character } from './Storage/storage.js';
import { UnitsListWidget } from './Widgets/units_list.js';
import { globals } from '../globals.js';
var bcp = false;
BattleView.set_callbacks((event) => {
    let mouse_pos = BattleView.get_mouse_pos_in_canvas(event);
    BattleImage.hover(mouse_pos);
}, (event) => {
    event.preventDefault();
    bcp = true;
}, (event) => {
    let mouse_pos = BattleView.get_mouse_pos_in_canvas(event);
    if (bcp) {
        BattleImage.press(mouse_pos);
        bcp = false;
    }
});
export let battle_in_progress = false;
export let events_list = [];
export let units_socket = [];
//persistent
let actions = [];
let key_to_action = {};
let key_to_action_type = {};
function HOTKEYS_HANDLER(e) {
    let action = key_to_action[e.key];
    if (action != undefined) {
        BattleImage.send_action(action, key_to_action_type[e.key]);
    }
}
document.addEventListener('keyup', HOTKEYS_HANDLER, false);
export var BattleImage;
(function (BattleImage) {
    function request_actions_self() {
        console.log('request actions self');
        socket.emit('req-battle-actions-self');
    }
    function request_actions_unit(target) {
        console.log('request actions unit');
        socket.emit('req-battle-actions-unit', target);
    }
    function request_actions_position(target) {
        console.log('request actions position');
        socket.emit('req-battle-actions-position', target);
    }
    function load(data) {
        console.log('load battle');
        console.log(data);
        BattleView.regenerate_tiles();
        reset();
        for (let [_, unit] of Object.entries(data)) {
            load_unit(unit);
        }
        socket.emit('req-player-index');
        // socket.emit('req-flee-chance')
        request_actions_self();
        socket.emit('req-battle-actions');
    }
    BattleImage.load = load;
    function reset() {
        battle_in_progress = false;
        BattleView.anchor_position = undefined;
        BattleView.player = undefined;
        BattleView.selected = undefined;
        events_list = [];
    }
    BattleImage.reset = reset;
    function load_unit(unit) {
        console.log('load unit');
        console.log(unit);
        console.log("add fighter");
        BattleStorage.register_unit(unit);
        if (unit.id == globals.character_data?.id) {
            BattleView.player = unit;
        }
    }
    BattleImage.load_unit = load_unit;
    function estimate_events_time() {
        return events_list.length;
    }
    BattleImage.estimate_events_time = estimate_events_time;
    function handle_keyframe(keyframe) {
        console.log("handle keyframe:");
        console.log(keyframe);
        BattleStorage.update_old_keyframe();
        for (const unit of keyframe.data) {
            BattleStorage.update_unit_data(unit);
        }
    }
    BattleImage.handle_keyframe = handle_keyframe;
    function update(dt) {
        let estimated_events_time = estimate_events_time();
        let time_scale = 1;
        if (estimated_events_time > 0.5) {
            time_scale = estimated_events_time / 0.5;
        }
        const scaled_dt = dt * time_scale;
        BattleStorage.event_timer = Math.min(BattleStorage.event_timer_max, BattleStorage.event_timer + scaled_dt);
        update_selection_data();
        let current_event = events_list[0];
        if (current_event != undefined) {
            if (BattleStorage.event_timer >= BattleStorage.event_timer_max) {
                handle_keyframe(current_event);
                events_list = events_list.slice(1);
                BattleStorage.event_timer = 0;
            }
        }
    }
    BattleImage.update = update;
    function new_event(event) {
        events_list.push(event);
        events_list.sort((a, b) => {
            return (a.index - b.index);
        });
    }
    BattleImage.new_event = new_event;
    function unload_unit(unit) {
        unload_unit_by_id(unit.id);
    }
    BattleImage.unload_unit = unload_unit;
    function unload_unit_by_id(unit) {
        UnitsListWidget.remove_unit(unit);
        BattleStorage.remove_unit(unit);
    }
    BattleImage.unload_unit_by_id = unload_unit_by_id;
    function unselect() {
        BattleStorage.foreach((id, unit) => UnitsListWidget.unselect(id));
        BattleView.selected = undefined;
        BattleView.anchor_position = undefined;
    }
    function update_selection_data() {
        const player_data = BattleView.player;
        const target_data = BattleView.selected;
        if (player_data == undefined)
            return;
        if (target_data == undefined)
            return;
        request_actions_unit(target_data.id);
    }
    BattleImage.update_selection_data = update_selection_data;
    function select(index) {
        unselect();
        BattleView.selected = fatten_battle_character(index);
        UnitsListWidget.selected = index;
        update_selection_data();
    }
    BattleImage.select = select;
    function d2(a, b) {
        return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
    }
    const selection_magnet = 400;
    function hover(pos) {
        clear_hover();
        BattleStorage.foreach((id, unit) => {
            let centre = BattleView.battle_to_canvas(unit.position, BattleView.camera);
            if (d2([centre.x, centre.y], [pos.x, pos.y]) < selection_magnet) {
                set_hover(unit);
            }
        });
    }
    BattleImage.hover = hover;
    function set_hover(unit) {
        BattleView.hovered = unit;
        UnitsListWidget.hovered = unit.id;
    }
    BattleImage.set_hover = set_hover;
    function clear_hover() {
        BattleView.hovered = undefined;
        BattleStorage.foreach((id, unit) => {
            UnitsListWidget.unhover(id);
        });
    }
    BattleImage.clear_hover = clear_hover;
    function press(pos) {
        let selected = false;
        BattleStorage.foreach((id, unit) => {
            let centre = BattleView.battle_to_canvas(unit.position, BattleView.camera);
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                select(id);
                selected = true;
            }
        });
        if (selected)
            return;
        unselect();
        BattleView.anchor_position = pos;
        request_actions_position(BattleView.canvas_to_battle(pos));
    }
    BattleImage.press = press;
    function add_action(action_type, hotkey) {
        console.log('new action');
        console.log(action_type);
        actions.push(action_type);
        console.log(action_type);
        let action_div = document.createElement('div');
        action_div.classList.add('battle_action');
        action_div.classList.add(action_type.tag);
        action_div.id = "battle_action_" + action_type.tag;
        {
            let label = document.createElement('div');
            label.innerHTML = `(${hotkey || ''}) ${action_type.name}`;
            action_div.appendChild(label);
        }
        {
            let label = document.createElement('div');
            label.id = action_type.tag + '_ap_cost';
            action_div.appendChild(label);
            if (action_type.cost != undefined) {
                label.innerHTML = 'ap: ' + action_type.cost.toFixed(2);
            }
        }
        {
            let label = document.createElement('div');
            label.id = action_type.tag + '_chance_b';
            label.innerHTML = '???%';
            action_div.appendChild(label);
        }
        {
            let label = document.createElement('div');
            label.id = action_type.tag + '_damage_b';
            label.innerHTML = '???';
            action_div.appendChild(label);
        }
        if (hotkey != undefined) {
            key_to_action[hotkey] = action_type.tag;
            key_to_action_type[hotkey] = action_type.target;
        }
        action_div.onclick = () => send_action(action_type.tag, action_type.target);
        // action_divs[action_type.name] = action_div
        let div = document.querySelector('.battle_control');
        div.appendChild(action_div);
    }
    BattleImage.add_action = add_action;
    function update_action(data, hotkey) {
        let flag = false;
        for (let item of actions) {
            if (item.tag == data.tag) {
                flag = true;
                update_action_cost(data.tag, data.cost);
                update_action_probability(data.tag, data.probability);
                update_action_damage(data.tag, data.damage);
                let div = document.querySelector('.battle_control>.' + data.tag);
                if (!data.possible) {
                    div.classList.add('disabled');
                }
                else {
                    div.classList.remove('disabled');
                }
            }
        }
        if (!flag)
            add_action(data, hotkey);
    }
    BattleImage.update_action = update_action;
    function update_action_probability(tag, value) {
        console.log(tag, value);
        let label = document.getElementById(tag + '_chance_b');
        label.innerHTML = Math.floor(value * 100).toFixed(1) + '%';
    }
    BattleImage.update_action_probability = update_action_probability;
    function update_action_damage(tag, value) {
        console.log(tag, value);
        let label = document.getElementById(tag + '_damage_b');
        label.innerHTML = '~' + value.toFixed(2);
    }
    BattleImage.update_action_damage = update_action_damage;
    function update_action_cost(tag, value) {
        console.log(tag, value);
        let label = document.getElementById(tag + '_ap_cost');
        label.innerHTML = value.toFixed(2);
    }
    BattleImage.update_action_cost = update_action_cost;
    function set_current_turn(index, time_passed) {
        BattleView.current_turn = fatten_battle_character(index);
        BattleStorage.foreach((id, unit) => {
            unit.next_turn -= time_passed;
            UnitsListWidget.unturn(id);
        });
        UnitsListWidget.current_turn = index;
    }
    BattleImage.set_current_turn = set_current_turn;
    function send_action(tag, target_type) {
        console.log('send action ' + tag, BattleView.selected, BattleView.canvas_to_battle(BattleView.anchor_position || { x: 0, y: 0 }));
        if (target_type == 'self') {
            socket.emit('battle-action-self', tag);
        }
        if (target_type == 'unit') {
            socket.emit('battle-action-unit', { tag: tag, target: BattleView.selected });
        }
        if (target_type == 'position') {
            if (BattleView.anchor_position != undefined) {
                socket.emit('battle-action-position', { tag: tag, target: BattleView.canvas_to_battle(BattleView.anchor_position) });
            }
        }
    }
    BattleImage.send_action = send_action;
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
    function draw_units(dt) {
        //sort views by y coordinate
        var draw_order = BattleStorage.units;
        draw_order.sort((a, b) => {
            const A = BattleStorage.from_id(a);
            const B = BattleStorage.from_id(b);
            return (-A.position.y + B.position.y);
        });
        //draw views
        for (let character_id of draw_order) {
            let view = fatten_battle_character(character_id);
            if (view.hp == 0)
                continue;
            const image = BattleStorage.image_from_id(character_id);
            BattleView.draw(dt, view, image);
        }
    }
    BattleImage.draw_units = draw_units;
    function draw(dt) {
        BattleView.draw_background();
        update(dt);
        draw_units(dt);
        BattleView.draw_anchor();
        BattleView.draw_current_turn();
        BattleView.draw_hovered();
        BattleView.draw_player();
        BattleView.draw_selected();
    }
    BattleImage.draw = draw;
    function update_units_displays() {
        UnitsListWidget.enemies_list.update_display();
    }
    BattleImage.update_units_displays = update_units_displays;
})(BattleImage || (BattleImage = {}));
