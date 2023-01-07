import { BattleImage, battle_in_progress } from "./battle_image.js";
import { tab } from "../ViewManagement/tab.js";
import { socket } from "../globals.js";
import { AttackEvent, EndTurn, MoveEvent, NewTurnEvent, NewUnitEvent, RangedAttackEvent, RetreatEvent, UnitLeftEvent, UpdateDataEvent } from "./battle_image_events.js";
// export const battle_image = new BattleImageNext();
const events_queue = [];
BattleImage.add_action({ name: 'Move', tag: 'move' }, 'q');
BattleImage.add_action({ name: 'Slash', tag: 'attack_slice', cost: 3 }, 'w');
BattleImage.add_action({ name: 'Pierce', tag: 'attack_pierce', cost: 3 }, 'e');
BattleImage.add_action({ name: 'Knock', tag: 'attack_blunt', cost: 3 }, 'r');
BattleImage.add_action({ name: 'Magic Bolt', tag: 'magic_bolt', cost: 3 }, 'a');
BattleImage.add_action({ name: 'Shoot', tag: 'shoot', cost: 3, probabilistic: true }, 's');
BattleImage.add_action({ name: 'Dodge', tag: 'dodge', cost: 4 }, 'd');
BattleImage.add_action({ name: 'Retreat', tag: 'flee', cost: 3, probabilistic: true }, 'f');
BattleImage.add_action({ name: 'Switch Weapon', tag: 'switch_weapon', cost: 3 }, 'z');
BattleImage.add_action({ name: 'End Turn', tag: 'end_turn', cost: 0 }, 'x');
//              BATTLES 
const UNIT_ID_MESSAGE = 'unit_id';
const BATTLE_DATA_MESSAGE = 'battle_data';
const BATTLE_CURRENT_UNIT = 'current_unit_turn';
var bCallback;
(function (bCallback) {
    function link_player_to_unit(data) {
        BattleImage.set_player(data);
    }
    bCallback.link_player_to_unit = link_player_to_unit;
    function link_current_turn(data) {
        BattleImage.set_current_turn(data, 0);
    }
    bCallback.link_current_turn = link_current_turn;
    function update_battle_state(data) {
        BattleImage.load(data);
    }
    bCallback.update_battle_state = update_battle_state;
    function update_battle_process(flag) {
        console.log('battle-in-process ' + flag);
        if (flag) {
            if (battle_in_progress) {
                socket.emit('request-battle-data');
            }
            start_battle();
        }
        else {
            end_battle();
        }
    }
    bCallback.update_battle_process = update_battle_process;
    function event(action) {
        console.log(action);
        switch (action.tag) {
            case 'attack': {
                BattleImage.new_event(new AttackEvent(action.index, action.creator, -action.cost, 0, action.target_unit));
                return true;
            }
            case 'flee': {
                BattleImage.new_event(new RetreatEvent(action.index, action.creator, action.cost));
                return true;
            }
            case 'miss': {
                return true;
            }
            case 'move': {
                BattleImage.new_event(new MoveEvent(action.index, action.creator, -action.cost, action.target_position));
                return true;
            }
            case 'new_turn': {
                BattleImage.new_event(new NewTurnEvent(action.index, action.creator, action.data));
                return true;
            }
            case 'ranged_attack': {
                BattleImage.new_event(new RangedAttackEvent(action.index, action.creator, -action.cost, 0, action.target_unit));
                return true;
            }
            case 'unit_join': {
                BattleImage.new_event(new NewUnitEvent(action.index, action.creator, action.data));
                return true;
            }
            case 'unit_left': {
                BattleImage.new_event(new UnitLeftEvent(action.index, action.creator, 0, 0, 0));
                return true;
            }
            case 'update': {
                BattleImage.new_event(new UpdateDataEvent(action.index, action.creator, action.data));
                return true;
            }
            case 'end_turn': {
                BattleImage.new_event(new EndTurn(action.index, action.creator, -action.cost));
                return true;
            }
        }
    }
    bCallback.event = event;
})(bCallback || (bCallback = {}));
function start_battle() {
    console.log('start battle');
    tab.turn_on('battle');
    // BattleImage.reset()
}
function end_battle() {
    tab.turn_off('battle');
    BattleImage.reset();
}
// non events
socket.on('action-display', data => { BattleImage.update_action_display(data.tag, data.value); });
// socket.on('new-action',                 msg => BattleImage.add_action({name: msg, tag:msg}, undefined));
socket.on('b-action-chance', msg => BattleImage.update_action_probability(msg.tag, msg.value));
socket.on('battle-in-process', bCallback.update_battle_process);
// socket.on(BATTLE_DATA_MESSAGE,          bCallback.update_battle_state)
socket.on('battle-update-units', data => BattleImage.load(data));
socket.on(UNIT_ID_MESSAGE, bCallback.link_player_to_unit);
socket.on('current-unit-turn', bCallback.link_current_turn);
// socket.on('battle-update-unit',         data => .update_unit(data))
// socket.on('battle-new-unit',                bCallback.new_unit)
// socket.on('battle-remove-unit',             bCallback.remove_unit)
// socket.on(BATTLE_CURRENT_UNIT,          bCallback.set_current_active_unit)
socket.on('battle-event', bCallback.event);
console.log('battle callbacks are loaded');
