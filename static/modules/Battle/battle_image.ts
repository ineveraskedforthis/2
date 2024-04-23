import { canvas_position } from './battle_image_helper.js'
import { BattleData, UnitSocket, battle_position, BattleActionData, BattleKeyframeSocket, seconds } from "../../../shared/battle_data.js"
import { socket } from "../Socket/socket.js";
import { character_id } from '@custom_types/ids.js';
import { BattleView } from './View/battle_view.js';
import { BattleStorage, fatten_battle_character } from './Storage/storage.js';
import { UnitsListWidget } from './Widgets/units_list.js';
import { UnitViewMinimal } from './Types/UnitView.js';
import { globals } from '../globals.js';
import { ActionsListWidget } from './Widgets/action_list.js';

var bcp = false

BattleView.set_callbacks(
    (event: any) => {
        let mouse_pos = BattleView.get_mouse_pos_in_canvas(event);
        BattleImage.hover(mouse_pos);
    },
    (event: any) => {
        event.preventDefault();
        bcp = true
    },
    (event: any) => {
        let mouse_pos = BattleView.get_mouse_pos_in_canvas(event);
        if (bcp) {
            BattleImage.press(mouse_pos);
            bcp = false;
        }
    }
)

export let events_list  : BattleKeyframeSocket[]     = [];
export let units_socket : UnitSocket[]               = [];

let key_to_action: {[_ in string]: string|undefined} = {}
let key_to_action_type : {[_ in string]: 'unit'|'self'|'position'} = {}

function HOTKEYS_HANDLER(e: KeyboardEvent) {
    let action = key_to_action[e.key]
    if (action != undefined) {
        BattleImage.send_action(action, key_to_action_type[e.key])
    }
}

document.addEventListener('keyup', HOTKEYS_HANDLER, false);

export namespace BattleImage {
    export function request_all_actions() {
        socket.emit('req-battle-actions-all');
    }

    function request_actions() {
        console.log('request actions');
        socket.emit('req-battle-actions-self');
        if (BattleView.selected)
            socket.emit('req-battle-actions-unit', BattleView.selected);
        if (BattleView.anchor_position)
            socket.emit('req-battle-actions-position', BattleView.anchor_position);
    }

    export function request_actions_self() {
        console.log('request actions self')
        socket.emit('req-battle-actions-self')
    }

    function request_actions_unit(target: character_id) {
        console.log('request actions unit')
        socket.emit('req-battle-actions-unit', target)
    }

    function request_actions_position(target: battle_position) {
        console.log('request actions position')
        socket.emit('req-battle-actions-position', target)
    }

    export function load(data: BattleData, battle_in_progress: boolean) {
        console.log('load battle')
        console.log(data)
        if (!battle_in_progress) {
            BattleView.regenerate_tiles();
            reset()
        }

        BattleStorage.clear()
        for (let [_, unit] of Object.entries(data)) {
            load_unit(unit)
        }

        socket.emit('req-player-index')
        // socket.emit('req-flee-chance')

        request_actions_self()

        socket.emit('req-battle-actions')
    }

    export function reset() {
        BattleView.anchor_position = undefined
        BattleView.player = undefined
        BattleView.selected = undefined
        BattleView.current_turn = undefined

        BattleStorage.clear()

        events_list = [];
    }

    export function load_unit(unit: UnitSocket) {
        console.log('load unit')
        console.log(unit)
        console.log("add fighter")

        BattleStorage.register_unit(unit)

        console.log(unit.id)
        console.log(globals.character_data)
        if (unit.id == globals.character_data?.id) {
            console.log("Player Detected!!")
            BattleView.player = fatten_battle_character(unit.id)
        }
    }

    export function estimate_events_time() {
        return events_list.length
    }

    export function handle_keyframe(keyframe: BattleKeyframeSocket) {

        console.log("handle keyframe:")
        console.log(keyframe)
        BattleStorage.update_old_keyframe()
        for (const unit of keyframe.data) {
            if (unit.action.action == "unit_left") {
                BattleStorage.remove_unit(unit.id)
            } else {
                BattleStorage.update_unit_data(unit)
            }
        }
        request_actions()
    }

    export function update(dt: seconds) {
        let estimated_events_time = estimate_events_time()
        let time_scale = 1
        if (estimated_events_time > 0.5) {
            time_scale = estimated_events_time / 0.5
        }

        const scaled_dt = dt * time_scale
        BattleStorage.event_timer = Math.min(BattleStorage.event_timer_max, BattleStorage.event_timer + scaled_dt) as seconds

        update_selection_data()

        let current_event = events_list[0]
        if (current_event != undefined) {
            if (BattleStorage.event_timer >= BattleStorage.event_timer_max) {
                handle_keyframe(current_event)
                events_list = events_list.slice(1)
                BattleStorage.event_timer = 0 as seconds
            }
        }
    }

    export function new_event(event: BattleKeyframeSocket) {
        events_list.push(event)
        events_list.sort((a, b) => {
            return (a.index - b.index)
        })
    }

    export function unload_unit(unit: UnitSocket) {
        unload_unit_by_id(unit.id)
    }

    export function unload_unit_by_id(unit: character_id) {
        console.log("remove unit ", unit)
        if (BattleView.selected?.id == unit) {
            BattleView.selected = undefined
        }
        if (BattleView.hovered?.id == unit) {
            BattleView.hovered = undefined
        }
        if (BattleView.player?.id == unit) {
            BattleView.player = undefined
        }
        if (BattleView.current_turn?.id == unit) {
            BattleView.current_turn = undefined
        }
        UnitsListWidget.remove_unit(unit)
        BattleStorage.remove_unit(unit)
    }

    function unselect() {
        BattleStorage.foreach((id, unit) => UnitsListWidget.unselect(id))
        BattleView.selected = undefined
        BattleView.anchor_position = undefined
    }

    export function update_selection_data() {
        const player_data = BattleView.player
        const target_data = BattleView.selected
        if (player_data == undefined) return
        if (target_data == undefined) return
    }

    export function select(index: character_id) {
        unselect()
        BattleView.selected = fatten_battle_character(index)
        UnitsListWidget.selected = index
        request_actions_unit(index)
        update_selection_data()
    }

    function d2(a: [number, number], b: [number, number]) {
        return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
    }

    const selection_magnet = 400;

    export function hover(pos: canvas_position) {
        clear_hover()
        BattleStorage.foreach((id, unit) => {
            if (unit.dead) return;
            let centre = BattleView.battle_to_canvas(unit.position, BattleView.camera)
            if (d2([centre.x, centre.y], [pos.x, pos.y]) < selection_magnet) {
                set_hover(fatten_battle_character(id))
            }
        })
    }


    export function set_hover(unit: UnitViewMinimal) {
        BattleView.hovered = unit
        UnitsListWidget.hovered = unit.id
    }


    export function clear_hover() {
        BattleView.hovered = undefined

        BattleStorage.foreach((id, unit) => {
            UnitsListWidget.unhover(id)
        })
    }

    export function press(pos: canvas_position) {
        let selected = false;
        BattleStorage.foreach((id, unit) => {
            if (unit.dead) return;
            let centre = BattleView.battle_to_canvas(unit.position, BattleView.camera)
            let dx = centre.x - pos.x;
            let dy = centre.y - pos.y;
            dx = dx * dx;
            dy = dy * dy;
            if (dx + dy < 400) {
                select(id)
                selected = true
            }
        })
        if (selected) return;

        unselect()
        BattleView.anchor_position = pos
        request_actions_position(BattleView.canvas_to_battle(pos))
    }

    export function add_action(action_type:BattleActionData, hotkey: string|undefined) {
        if (hotkey != undefined) {
            key_to_action[hotkey] = action_type.tag
            key_to_action_type[hotkey] = action_type.target
        }
    }

    export function update_action(data: BattleActionData, hotkey: string) {
        console.log("update action: ", data.tag)
        console.log(data)
        if (!ActionsListWidget.update_action(data)) {
            add_action(data, hotkey)
        }
    }

    export function set_current_turn(index: character_id, time_passed: number) {
        console.log('Set current_turn', index)

        BattleView.current_turn = fatten_battle_character(index)

        BattleStorage.foreach((id, unit) => {
            unit.next_turn -= time_passed
            UnitsListWidget.unturn(id)
        })

        UnitsListWidget.current_turn = index
    }

    export function send_action(tag:string, target_type: 'self'|'unit'|'position') {
        console.log(
            'send action ' + tag,
            BattleView.selected,
            BattleView.canvas_to_battle(BattleView.anchor_position||{x: 0, y: 0} as canvas_position)
        )

        if (target_type == 'self') {
            socket.emit('battle-action-self', tag)
        }

        if ((target_type == 'unit') && (BattleView.selected != undefined)) {
            socket.emit('battle-action-unit', {tag: tag, target: BattleView.selected.id})
        }

        if (target_type == 'position') {
            if (BattleView.anchor_position != undefined) {
                socket.emit('battle-action-position', {tag: tag, target: BattleView.canvas_to_battle(BattleView.anchor_position)})
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

    export function draw_units(dt: number) {
        //sort views by y coordinate


        var draw_order = BattleStorage.units

        draw_order.sort((a, b) => {
            const A = BattleStorage.from_id(a)
            const B = BattleStorage.from_id(b)
            return (-A.position.y + B.position.y)
        })

        //draw views
        for (let character_id of draw_order) {
            let view = fatten_battle_character(character_id)
            if (view.hp == 0) continue
            const image = BattleStorage.image_from_id(character_id)
            if (character_id == globals.character_data?.id) {
                BattleView.player = view
            }
            BattleView.draw(dt, view, image)
        }
    }

    export function draw(dt: seconds) {
        BattleView.draw_background()
        update(dt)

        draw_units(dt)

        BattleView.draw_anchor()
        BattleView.draw_current_turn()
        BattleView.draw_hovered()
        BattleView.draw_player()
        BattleView.draw_selected()
    }

    export function update_units_displays() {
        UnitsListWidget.enemies_list.update_display()
    }
}