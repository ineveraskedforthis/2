import { BattleImage, battle_in_progress, events_list, player_unit_id } from "./battle_image.js";
import { BattleActionChance, BattleData, BattleEventSocket, unit_id, Socket, UnitSocket } from "../../../shared/battle_data.js"
import { tab } from "../ViewManagement/tab.js";
import { socket } from "../globals.js"
import { AttackEvent, EndTurn, MoveEvent, NewTurnEvent, NewUnitEvent, RetreatEvent } from "./battle_image_events.js";

// export const battle_image = new BattleImageNext();
const events_queue: BattleEventSocket[] = []









BattleImage.add_action({name: 'move', tag: 'move'})
BattleImage.add_action({name: 'Slash', tag: 'attack_slice', cost: 3})
BattleImage.add_action({name: 'Pierce', tag: 'attack_pierce', cost: 3})
BattleImage.add_action({name: 'Knock',  tag: 'attack_blunt', cost: 3})

// battle_image.add_action({name: 'magic_bolt', tag: 'magic_bolt', cost: 3})
// battle_image.add_action({name: 'fast attack', tag: 'fast_attack', cost: 1})
BattleImage.add_action({name: 'shoot', tag: 'shoot', cost: 3})
// battle_image.add_action({name: 'dodge', tag: 'dodge', cost: 4})
// battle_image.add_action({name: 'push back', tag: 'push_back', cost: 5})

BattleImage.add_action({name: 'retreat', tag: 'flee', cost: 3})
BattleImage.add_action({name: 'switch weapon', tag: 'switch_weapon', cost: 3})
BattleImage.add_action({name: 'end turn', tag: 'end_turn', cost: 0})



//              BATTLES 
const UNIT_ID_MESSAGE = 'unit_id'
const BATTLE_DATA_MESSAGE = 'battle_data'
const BATTLE_CURRENT_UNIT = 'current_unit_turn'



namespace bCallback {    
    export function link_player_to_unit(data: unit_id) {
        BattleImage.set_player(data)
    }

    export function update_battle_state(data: BattleData) {
        BattleImage.load(data) 
    }

    export function update_battle_process(flag: boolean) {
        console.log('battle-in-process ' + flag)
        if (flag) {
            if (battle_in_progress) {
                socket.emit('request-battle-data')
            }
            start_battle()
        } else {
            end_battle()
        }
    }

    export function event(action: BattleEventSocket) {
        console.log(action)
        // handle real actions
        if (action.tag == 'move') {
            BattleImage.new_event(new MoveEvent(action.index, action.creator, -action.cost, action.target_position))
        } else if (action.tag == 'attack') {
            BattleImage.new_event(new AttackEvent(action.index, action.creator, -action.cost, 0, action.target_unit))
        } else if (action.tag == 'new_turn') {
            BattleImage.new_event(new NewTurnEvent(action.index, action.creator))
        } else if (action.tag == 'flee'){
            BattleImage.new_event(new RetreatEvent(action.index, action.creator))
        } else if (action.tag == 'end_turn') {
            BattleImage.new_event(new EndTurn(action.index, action.creator, -action.cost))
        } else if (action.tag == 'miss') {
            // BattleImage.new_event(new MissEvent(action.creator, action.target_unit))
        } else if (action.tag == 'ranged_attack') {
            BattleImage.new_event(new AttackEvent(action.index, action.creator, -action.cost, 0, action.target_unit))
        } else {
            console.log('unhandled input')
            console.log(action)
        }
    }
}

function start_battle() {
    console.log('start battle')
    tab.turn_on('battle')
    BattleImage.reset()
}

function end_battle() {
    tab.turn_off('battle')
    BattleImage.reset()
}


// non events
socket.on('action-display', data =>     {BattleImage.update_action_display(data.tag, data.value)})
socket.on('new-action',                 msg => BattleImage.add_action({name: msg, tag:msg}));
socket.on('b-action-chance',            msg => BattleImage.update_action_probability(msg.tag, msg.value))
socket.on('battle-in-process',          bCallback.update_battle_process)
// socket.on(BATTLE_DATA_MESSAGE,          bCallback.update_battle_state)
socket.on('battle-update-units',        data => BattleImage.load(data))
socket.on(UNIT_ID_MESSAGE,              bCallback.link_player_to_unit)

// socket.on('battle-update-unit',         data => .update_unit(data))

// socket.on('battle-new-unit',                bCallback.new_unit)
// socket.on('battle-remove-unit',             bCallback.remove_unit)

// socket.on(BATTLE_CURRENT_UNIT,          bCallback.set_current_active_unit)
socket.on('battle-event',               bCallback.event)

console.log('battle callbacks are loaded')