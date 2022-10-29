import { BattleImageNext } from "./battle_image.js";
import { AttackEvent, get_mouse_pos_in_canvas, MissEvent, MovementBattleEvent, NewTurnEvent, RetreatEvent } from "./battle_image_helper.js";
import { BattleActionChance, BattleData, BattleEventSocket, unit_id, Socket } from "../../../shared/battle_data"
import { tab } from "../ViewManagement/tab.js";
import { socket } from "../globals.js"

export const battle_image = new BattleImageNext(document.getElementById('battle_canvas'), document.getElementById('battle_canvas_background'));
const events_queue: BattleEventSocket[] = []



var bcp = false



battle_image.canvas.onmousedown = (event: any) => {
    event.preventDefault();
    bcp = true
}

battle_image.canvas.onmousemove = (event: any) => {
    let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
    battle_image.hover(mouse_pos);
};

battle_image.canvas.onmouseup = (event: any) => {
    let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
    if (bcp) {
        battle_image.press(mouse_pos);
        bcp = false;
    }
}

battle_image.socket = socket;

battle_image.add_action({name: 'move', tag: 'move'})
battle_image.add_action({name: 'Slash', tag: 'attack_slice', cost: 3})
battle_image.add_action({name: 'Pierce', tag: 'attack_pierce', cost: 3})
battle_image.add_action({name: 'Knock',  tag: 'attack_blunt', cost: 3})

// battle_image.add_action({name: 'magic_bolt', tag: 'magic_bolt', cost: 3})
// battle_image.add_action({name: 'fast attack', tag: 'fast_attack', cost: 1})
battle_image.add_action({name: 'shoot', tag: 'shoot', cost: 3})
// battle_image.add_action({name: 'dodge', tag: 'dodge', cost: 4})
// battle_image.add_action({name: 'push back', tag: 'push_back', cost: 5})

battle_image.add_action({name: 'retreat', tag: 'flee', cost: 3})
battle_image.add_action({name: 'switch weapon', tag: 'switch_weapon', cost: 3})
battle_image.add_action({name: 'end turn', tag: 'end_turn', cost: 0})



//              BATTLES 
const UNIT_ID_MESSAGE = 'unit_id'
const BATTLE_DATA_MESSAGE = 'battle_data'
const BATTLE_CURRENT_UNIT = 'current_unit_turn'



namespace bCallback {
    export function set_current_active_unit(data: unit_id) {
        battle_image.set_current_turn(data)
    }
    
    export function link_player_to_unit(data: unit_id) {
        battle_image.set_player(data)
    }

    export function update_battle_state(data: BattleData) {
        battle_image.update(data) 
    }

    export function update_battle_process(flag: boolean) {
        console.log('battle-in-process ' + flag)
        if (flag) {
            if (battle_image.in_progress) {
                socket.emit('request-battle-data')
            }
            start_battle()
        } else {
            end_battle()
        }
    }

    export function event(action: BattleEventSocket) {
        // handle real actions
        if (action.tag == 'move') {
            let event = new MovementBattleEvent(action.creator, action.target_position)
            console.log('move', action.target_position)
            battle_image.events_list.push(event)        
        }
        else if (action.tag == 'attack') {
            let event = new AttackEvent(action.creator, action.target_unit)
            battle_image.events_list.push(event)
        // }
        // else if (action.tag == '') {
        //     let event = new ClearBattleEvent()
        //     battle_image.events_list.push(event)
        } else if (action.tag == 'new_turn') {
            let event = new NewTurnEvent(action.creator)
            battle_image.events_list.push(event)
        } else if (action.tag == 'flee'){
            battle_image.events_list.push(new RetreatEvent(action.creator))
        } else if (action.tag == 'end_turn') {
            // battle_image.events_list.push()
        } else if (action.tag == 'miss') {
            battle_image.events_list.push(new MissEvent(action.creator, action.target_unit))
        } else if (action.tag == 'ranged_attack') {
            let event = new AttackEvent(action.creator, action.target_unit)
            battle_image.events_list.push(event)
        }     
        else {
            console.log('unhandled input')
            console.log(action)
        }
    }
}

function start_battle() {
    console.log('start battle')
    tab.turn_on('battle')
    battle_image.clear()
}

function end_battle() {
    tab.turn_off('battle')
    battle_image.clear()
}


socket.on('action-display', data =>     {battle_image.update_action_display(data.tag, data.value)})
socket.on('new-action',                 msg => battle_image.add_action({name: msg, tag:msg}));
socket.on('b-action-chance',            msg => battle_image.update_action_probability(msg.tag, msg.value))
socket.on('battle-in-process',          bCallback.update_battle_process)
socket.on(BATTLE_DATA_MESSAGE,          bCallback.update_battle_state)
socket.on('battle-update-units',        data => battle_image.update(data))
socket.on('battle-update-unit',         data => battle_image.update_unit(data))
socket.on(UNIT_ID_MESSAGE,              bCallback.link_player_to_unit)
socket.on(BATTLE_CURRENT_UNIT,          bCallback.set_current_active_unit)
socket.on('battle-event',               bCallback.event)

console.log('battle callbacks are loaded')