"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleAction = void 0;
const manager_1 = require("../../actions/manager");
const actions_00_1 = require("../../actions/actions_00");
const events_1 = require("../../battle/events");
const system_1 = require("../../battle/system");
// import { Perks } from "../../character/Perks";
const checks_1 = require("../../character/checks");
const inventory_events_1 = require("../../events/inventory_events");
const systems_communication_1 = require("../../systems_communication");
const user_manager_1 = require("../user_manager");
const alerts_1 = require("./alerts");
const data_1 = require("../../data");
var HandleAction;
(function (HandleAction) {
    function response_to_alert(user, response) {
        switch (response.response) {
            case "TIRED": return;
            case "NO_RESOURCE": return alerts_1.Alerts.not_enough_to_user(user, 'something', undefined, undefined, undefined);
            case "IN_BATTLE": return alerts_1.Alerts.in_battle(user);
            case "OK": return;
            case "ZERO_MOTION": return alerts_1.Alerts.impossible_move(user);
            case "INVALID_MOTION": return alerts_1.Alerts.impossible_move(user);
            case "IMPOSSIBLE_ACTION": return;
            case "ALREADY_IN_AN_ACTION": return;
        }
    }
    function move(sw, data) {
        // do not handle unlogged or characterless
        if (sw.user_id == '#')
            return;
        const user = user_manager_1.UserManagement.get_user(sw.user_id);
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        // sanitise data
        const x = Number(data.x);
        const y = Number(data.y);
        if ((Number.isNaN(x)) || (Number.isNaN(y))) {
            return;
        }
        const destination = [x, y];
        const cell = data_1.Data.World.coordinate_to_id(destination);
        let response = manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, cell);
        response_to_alert(user, response);
    }
    HandleAction.move = move;
    function act(sw, action) {
        // do not handle unlogged or characterless
        if (sw.user_id == '#')
            return;
        const user = user_manager_1.UserManagement.get_user(sw.user_id);
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const destination = character.cell_id;
        let response = manager_1.ActionManager.start_action(action, character, destination);
        response_to_alert(user, response);
    }
    HandleAction.act = act;
    function battle(sw, input) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (!character.in_battle())
            return;
        const battle = systems_communication_1.Convert.character_to_battle(character);
        if (battle == undefined)
            return;
        const unit = systems_communication_1.Convert.character_to_unit(character);
        if (unit == undefined)
            return;
        if (!battle.waiting_for_input) {
            return;
        }
        if (battle.heap.get_selected_unit()?.id != unit.id) {
            return;
        }
        if (input == undefined)
            return;
        if (input.action == undefined)
            return;
        if (input.action == 'move') {
            if (input.target == undefined)
                return;
            const target = input.target;
            if (target.x == undefined)
                return;
            if (isNaN(target.x))
                return;
            if (target.y == undefined)
                return;
            if (isNaN(target.y))
                return;
            events_1.BattleEvent.Move(battle, unit, target);
        }
        else if (input.action == 'attack_slice') {
            if (input.target == undefined)
                return;
            const defender_id = input.target;
            const defender = system_1.BattleSystem.id_to_unit(defender_id, battle);
            if (defender == undefined)
                return undefined;
            events_1.BattleEvent.Attack(battle, unit, defender, 'slice');
        }
        else if (input.action == 'attack_blunt') {
            if (input.target == undefined)
                return;
            const defender_id = input.target;
            const defender = system_1.BattleSystem.id_to_unit(defender_id, battle);
            if (defender == undefined)
                return undefined;
            events_1.BattleEvent.Attack(battle, unit, defender, 'blunt');
        }
        else if (input.action == 'attack_pierce') {
            if (input.target == undefined)
                return;
            const defender_id = input.target;
            const defender = system_1.BattleSystem.id_to_unit(defender_id, battle);
            if (defender == undefined)
                return undefined;
            events_1.BattleEvent.Attack(battle, unit, defender, 'pierce');
        }
        else if (input.action == 'end_turn') {
            events_1.BattleEvent.EndTurn(battle, unit);
            // else if (input.action == 'fast_attack') {
            //     if(!can_fast_attack(character)) {
            //         return {action: "not_learnt"}
            //     }
            //     return  battle.action(index, BattleAI.convert_attack_to_action(battle, index, input.target, 'fast'))
        }
        else if (input.action == 'dodge') {
            if (!(0, checks_1.can_dodge)(character)) {
                return { action: "not_learnt" };
            }
            return events_1.BattleEvent.Dodge(battle, unit);
            // } else if (input.action == 'push_back') {
            //     if(!can_push_back(character)) {
            //         return {action: "not_learnt"}
            //     }
            //     return  battle.action(index, {action: 'push_back', target: input.target})
        }
        else if (input.action == 'magic_bolt') {
            if (input.target == undefined)
                return;
            const defender_id = input.target;
            const defender = system_1.BattleSystem.id_to_unit(defender_id, battle);
            return events_1.BattleEvent.MagicBolt(battle, unit, defender);
        }
        else if (input.action == 'shoot') {
            if (input.target == undefined)
                return;
            const defender_id = input.target;
            const defender = system_1.BattleSystem.id_to_unit(defender_id, battle);
            events_1.BattleEvent.Shoot(battle, unit, defender);
        }
        else if (input.action == 'flee') {
            events_1.BattleEvent.Flee(battle, unit);
        }
        else if (input.action == 'switch_weapon') {
            inventory_events_1.EventInventory.switch_weapon(character);
            events_1.BattleEvent.Update(battle, unit);
        }
        else {
            return;
        }
    }
    HandleAction.battle = battle;
})(HandleAction = exports.HandleAction || (exports.HandleAction = {}));
//  move(user: User, data: {x: number, y: number}) {
//     if (!user.logged_in) {
//         return 
//     }
//     let char = user.get_character();
// }
