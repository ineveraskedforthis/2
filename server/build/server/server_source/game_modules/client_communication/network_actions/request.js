"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const data_1 = require("../../data");
const constants_1 = require("../../static_data/constants");
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
const updates_1 = require("./updates");
const scripted_values_1 = require("../../events/scripted_values");
const DATA_LAYOUT_BUILDING_1 = require("../../DATA_LAYOUT_BUILDING");
const VALUES_1 = require("../../battle/VALUES");
const actions_1 = require("../../battle/actions");
const common_validations_1 = require("./common_validations");
var Request;
(function (Request) {
    function local_buildings(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        let ids = data_1.Data.Buildings.from_cell_id(character.cell_id);
        if (ids == undefined) {
            alerts_1.Alerts.generic_user_alert(user, 'buildings-info', []);
            return;
        }
        let buildings = Array.from(ids).map((id) => {
            let building = data_1.Data.Buildings.from_id(id);
            let rooms_occupied = data_1.Data.Buildings.occupied_rooms(id);
            let guests = data_1.Data.Buildings.guests(id);
            let guest_names = [];
            if (guests != undefined) {
                guest_names = Array.from(guests).map((g) => data_1.Data.CharacterDB.from_id(g).name);
            }
            let owner = data_1.Data.Buildings.owner(id);
            let name = 'None';
            if (owner != undefined) {
                name = data_1.Data.CharacterDB.from_id(owner).name;
            }
            else {
                owner = -1;
            }
            return {
                id: id,
                room_cost: scripted_values_1.ScriptedValue.room_price(id, character.id),
                room_cost_true: building.room_cost,
                rooms: (0, DATA_LAYOUT_BUILDING_1.rooms)(building.type),
                guests: guest_names,
                rooms_occupied: rooms_occupied,
                durability: building.durability,
                type: building.type,
                owner_id: owner,
                owner_name: name,
                cell_id: building.cell_id
            };
        });
        // console.log(buildings)
        alerts_1.Alerts.generic_user_alert(user, 'buildings-info', buildings);
        return;
    }
    Request.local_buildings = local_buildings;
    function player_index(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        const unit = systems_communication_1.Convert.character_to_unit(character);
        if (unit == undefined)
            return;
        const battle = systems_communication_1.Convert.character_to_battle(character);
        if (battle == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, constants_1.UNIT_ID_MESSAGE, unit.id);
        alerts_1.Alerts.generic_user_alert(user, 'current-unit-turn', battle.heap.get_selected_unit()?.id);
    }
    Request.player_index = player_index;
    function flee_chance(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        const unit = systems_communication_1.Convert.character_to_unit(character);
        if (unit == undefined)
            return;
        alerts_1.Alerts.battle_action_chance(user, 'flee', VALUES_1.BattleValues.flee_chance(unit.position));
    }
    Request.flee_chance = flee_chance;
    function attack_damage(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        updates_1.SendUpdate.attack_damage(user);
    }
    Request.attack_damage = attack_damage;
    // export function battle_actions(sw: SocketWrapper) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) {
    //         sw.socket.emit('alert', 'your character does not exist')
    //         return
    //     }
    //     const battle_id = character.battle_id
    //     if (battle_id == undefined) return 
    //     const battle = Convert.id_to_battle(battle_id);
    //     const unit = Convert.character_to_unit(character)
    //     if (unit == undefined) {return}
    //     for (let [key, item] of Object.entries(ActionsSelf)) {
    //         const result: BattleActionData = {
    //             name: key,
    //             tag: key,
    //             cost: item.ap_cost(battle, character, unit),
    //             damage: 0,
    //             probability: item.chance(battle, character, unit),
    //             target: 'self'
    //         }
    //         sw.socket.emit('battle-action-update', result)
    //     }
    // }
    function battle_actions_self(sw) {
        // console.log('requested self actions')
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        const battle_id = character.battle_id;
        if (battle_id == undefined)
            return;
        const battle = systems_communication_1.Convert.id_to_battle(battle_id);
        const unit = systems_communication_1.Convert.character_to_unit(character);
        if (unit == undefined) {
            return;
        }
        for (let [key, item] of Object.entries(actions_1.ActionsSelf)) {
            const result = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, unit),
                damage: 0,
                probability: item.chance(battle, character, unit),
                target: 'self',
                possible: (0, actions_1.battle_action_self_check)(key, battle, character, unit, 0).response == 'OK'
            };
            sw.socket.emit('battle-action-update', result);
        }
    }
    Request.battle_actions_self = battle_actions_self;
    function battle_actions_unit(sw, target_id) {
        // console.log('requested unit actions')
        if (target_id == undefined)
            return;
        if (typeof target_id !== 'number')
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        const battle_id = character.battle_id;
        if (battle_id == undefined)
            return;
        const battle = systems_communication_1.Convert.id_to_battle(battle_id);
        const unit = systems_communication_1.Convert.character_to_unit(character);
        if (unit == undefined) {
            return;
        }
        const target_unit = battle.heap.get_unit(target_id);
        if (target_unit == undefined)
            return;
        const target_character = systems_communication_1.Convert.unit_to_character(target_unit);
        for (let [key, item] of Object.entries(actions_1.ActionsUnit)) {
            const result = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, unit, target_character, target_unit),
                damage: item.damage(battle, character, unit, target_character, target_unit),
                probability: item.chance(battle, character, unit, target_character, target_unit),
                target: 'unit',
                possible: (0, actions_1.battle_action_unit_check)(key, battle, character, unit, target_character, target_unit, 0, 0).response == 'OK'
            };
            sw.socket.emit('battle-action-update', result);
        }
    }
    Request.battle_actions_unit = battle_actions_unit;
    function battle_actions_position(sw, target) {
        // console.log('requested position actions')
        if (target == undefined)
            return;
        if (!common_validations_1.Validator.is_point(target))
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        const battle_id = character.battle_id;
        if (battle_id == undefined)
            return;
        const battle = systems_communication_1.Convert.id_to_battle(battle_id);
        const unit = systems_communication_1.Convert.character_to_unit(character);
        if (unit == undefined) {
            return;
        }
        for (let [key, item] of Object.entries(actions_1.ActionsPosition)) {
            const result = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, unit, target),
                damage: 0,
                probability: 1,
                target: 'position',
                possible: (0, actions_1.battle_action_position_check)(key, battle, character, unit, target).response == 'OK'
            };
            sw.socket.emit('battle-action-update', result);
        }
    }
    Request.battle_actions_position = battle_actions_position;
})(Request = exports.Request || (exports.Request = {}));
