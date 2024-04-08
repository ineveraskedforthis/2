import { BattleImage, battle_in_progress, events_list, player_unit_id } from "./battle_image.js";
import { BattleActionChance, BattleData, BattleEventSocket, unit_id, Socket, UnitSocket, BattleActionData } from "../../../shared/battle_data.js"
import { tab } from "../ViewManagement/tab.js";
import { socket } from "../Socket/socket.js";
import { AttackEvent, EndTurn, MoveEvent, NewTurnEvent, NewUnitEvent, RangedAttackEvent, RetreatEvent, UnitLeftEvent, UpdateDataEvent } from "./battle_image_events.js";


// export const battle_image = new BattleImageNext();
const events_queue: BattleEventSocket[] = []

const keybinds: { [key: string]: string } = {
    'Move': 'q',
    'MoveTowards': 'w',
    'Slash': 'e',
    'Pierce': 'r',
    'Knock': 't',
    'MagicBolt': 'a',
    'Shoot': 's',
    'Retreat': 'd',
    'EndTurn': 'f',
}

export function init_battle_control() {
    socket.on('battle-action-set-up', (data: BattleActionData) => {
        BattleImage.add_action(data, keybinds[data.tag])
    })

    socket.on('battle-action-update', (data: BattleActionData) => {
        BattleImage.update_action(data, keybinds[data.tag])
    })

    // non events
    // socket.on('action-display', data =>     {BattleImage.update_action_display(data.tag, data.value)})
    // socket.on('new-action',                 msg => BattleImage.add_action({name: msg, tag:msg}, undefined));
    // socket.on('b-action-chance',            msg => BattleImage.update_action_probability(msg.tag, msg.value))
    // socket.on('b-action-damage',            msg => BattleImage.update_action_damage(msg.tag, msg.value))
    // socket.on('b-action-cost',              msg => BattleImage.update_action_cost(msg.tag, msg.value))
    socket.on('battle-in-process',          bCallback.update_battle_process)
    // socket.on(BATTLE_DATA_MESSAGE,          bCallback.update_battle_state)
    socket.on('battle-update-units',        data => BattleImage.load(data))
    socket.on(UNIT_ID_MESSAGE,              bCallback.link_player_to_unit)
    socket.on('current-unit-turn',          bCallback.link_current_turn)

    // socket.on('battle-update-unit',         data => .update_unit(data))

    // socket.on('battle-new-unit',                bCallback.new_unit)
    // socket.on('battle-remove-unit',             bCallback.remove_unit)

    // socket.on(BATTLE_CURRENT_UNIT,          bCallback.set_current_active_unit)
    socket.on('battle-event',               bCallback.event)

    console.log('battle callbacks are loaded')
}




//              BATTLES
const UNIT_ID_MESSAGE = 'unit_id'
const BATTLE_DATA_MESSAGE = 'battle_data'
const BATTLE_CURRENT_UNIT = 'current_unit_turn'



namespace bCallback {
    export function link_player_to_unit(data: unit_id) {
        BattleImage.set_player(data)
    }

    export function link_current_turn(data: unit_id) {
        BattleImage.set_current_turn(data, 0)
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

    export function event(action: BattleEventSocket): boolean {
        console.log(action)
        switch(action.tag) {
            case 'attack': {
                BattleImage.new_event(new AttackEvent(action.index, action.creator, -action.cost, 0, action.target_unit))
                return true
            }

            case 'flee': {
                BattleImage.new_event(new RetreatEvent(action.index, action.creator, action.cost))
                return true
            }

            case 'miss': {
                return true
            }

            case 'move': {
                BattleImage.new_event(new MoveEvent(action.index, action.creator, -action.cost, action.target_position))
                return true
            }

            case 'new_turn': {
                BattleImage.new_event(new NewTurnEvent(action.index, action.creator, action.data!))
                return true
            }

            case 'ranged_attack': {
                BattleImage.new_event(new RangedAttackEvent(action.index, action.creator, -action.cost, 0, action.target_unit))
                return true
            }

            case 'unit_join': {
                BattleImage.new_event(new NewUnitEvent(action.index, action.creator, action.data!))
                return true
            }

            case 'unit_left': {
                BattleImage.new_event(new UnitLeftEvent(action.index, action.creator, 0, 0, 0))
                return true
            }

            case 'update': {
                BattleImage.new_event(new UpdateDataEvent(action.index, action.creator, action.data!))
                return true
            }

            case 'end_turn': {
                BattleImage.new_event(new EndTurn(action.index, action.creator, -action.cost))
                return true
            }
        }
    }
}

function start_battle() {
    console.log('start battle')
    tab.turn_on('battle')
    // BattleImage.reset()
}

function end_battle() {
    tab.turn_off('battle')
    BattleImage.reset()
}