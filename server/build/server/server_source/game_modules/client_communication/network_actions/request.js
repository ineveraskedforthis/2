"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const perk_base_price_1 = require("../../prices/perk_base_price");
const skill_price_1 = require("../../prices/skill_price");
const data_1 = require("../../data");
const constants_1 = require("../../static_data/constants");
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
const updates_1 = require("./updates");
const scripted_values_1 = require("../../events/scripted_values");
const DATA_LAYOUT_BUILDING_1 = require("../../DATA_LAYOUT_BUILDING");
const triggers_1 = require("../../events/triggers");
const system_1 = require("../../character/system");
const VALUES_1 = require("../../battle/VALUES");
const actions_1 = require("../../battle/actions");
const common_validations_1 = require("./common_validations");
var Request;
(function (Request) {
    // export function accuracy(sw: SocketWrapper, distance: number) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return;
    //     if (!user.logged_in) {
    //         return 
    //     }
    //     if (isNaN(distance)) {
    //         return 
    //     }
    //     const acc = Accuracy.ranged(character, distance)
    //     Alerts.battle_action_chance(user, 'shoot', acc)
    //     let magic_bolt = DmgOps.total(Attack.generate_magic_bolt(character, distance).damage)
    //     Alerts.battle_action_damage(user, 'magic_bolt', magic_bolt)
    // }
    function perks_and_skills(sw, character_id) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        let target_character = systems_communication_1.Convert.id_to_character(character_id);
        if (target_character == undefined) {
            sw.socket.emit('alert', 'character does not exist');
            return;
        }
        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell');
            return;
        }
        if (character_id == character.id) {
            user.socket.emit('alert', "can't talk with yourself");
            return;
        }
        let data = target_character.perks;
        let response = {
            name: target_character.name,
            race: target_character.race(),
            factions: data_1.Data.Reputation.list_from_id(target_character.id),
            perks: {},
            skills: {}
        };
        for (let perk of Object.keys(data)) {
            if (data[perk] == true) {
                response.perks[perk] = (0, perk_base_price_1.perk_price)(perk, character, target_character);
            }
        }
        for (let skill of Object.keys(target_character._skills)) {
            let teaching_response = triggers_1.Trigger.can_learn_from(character, target_character, skill);
            // console.log(skill, teaching_response)
            if (teaching_response.response == 'ok' || teaching_response.response == triggers_1.ResponceNegativeQuantified.Money) {
                const teacher_skill = system_1.CharacterSystem.skill(target_character, skill);
                response.skills[skill] = [
                    teacher_skill,
                    (0, skill_price_1.skill_price)(skill, character, target_character)
                ];
            }
        }
        sw.socket.emit('perks-info', response);
    }
    Request.perks_and_skills = perks_and_skills;
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
            // let owner = Data.Buildings.owner(id)
            return {
                id: id,
                room_cost: scripted_values_1.ScriptedValue.room_price(id, character.id),
                rooms: (0, DATA_LAYOUT_BUILDING_1.rooms)(building.type),
                rooms_occupied: rooms_occupied,
                durability: building.durability,
                type: building.type,
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
                possible: (0, actions_1.battle_action_self_check)(key, battle, character, unit).response == 'OK'
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
                possible: (0, actions_1.battle_action_unit_check)(key, battle, character, unit, target_character, target_unit).response == 'OK'
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
