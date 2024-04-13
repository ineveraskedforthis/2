"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const constants_1 = require("../../static_data/constants");
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
const updates_1 = require("./updates");
const scripted_values_1 = require("../../events/scripted_values");
const VALUES_1 = require("../../battle/VALUES");
const actions_1 = require("../../battle/actions");
const common_validations_1 = require("./common_validations");
const data_id_1 = require("../../data/data_id");
const data_objects_1 = require("../../data/data_objects");
const heap_1 = require("../../battle/classes/heap");
const system_1 = require("../../map/system");
var Request;
(function (Request) {
    function map(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (map)');
            return;
        }
        updates_1.SendUpdate.map_related(user);
    }
    Request.map = map;
    function local_locations(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (local_locations)');
            return;
        }
        let ids = data_id_1.DataID.Cells.locations(character.cell_id);
        if (ids == undefined) {
            alerts_1.Alerts.generic_user_alert(user, 'locations-info', []);
            return;
        }
        let locations = ids.map((id) => {
            let location = data_objects_1.Data.Locations.from_id(id);
            let guests = data_id_1.DataID.Location.guest_list(id);
            let owner = location.owner_id;
            let name = 'None';
            if (owner != undefined) {
                name = data_objects_1.Data.Characters.from_id(owner).name;
            }
            else {
                owner = -1;
            }
            return {
                id: id,
                room_cost: scripted_values_1.ScriptedValue.rest_price(character, location),
                guests: guests.length,
                durability: scripted_values_1.ScriptedValue.max_devastation - location.devastation,
                owner_id: owner,
                owner_name: name,
                cell_id: location.cell_id,
                house_level: location.has_house_level,
                forest: location.forest,
                terrain: location.terrain,
                urbanisation: system_1.MapSystem.urbanisation(location.cell_id)
            };
        });
        // console.log(locations)
        alerts_1.Alerts.generic_user_alert(user, 'locations-info', locations);
        updates_1.SendUpdate.map_related(user);
        return;
    }
    Request.local_locations = local_locations;
    function player_index(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (player_index)');
            return;
        }
        const battle = systems_communication_1.Convert.character_to_battle(character);
        if (battle == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, constants_1.character_id_MESSAGE, character.id);
        alerts_1.Alerts.generic_user_alert(user, 'current-unit-turn', heap_1.CharactersHeap.get_selected_unit(battle)?.id);
    }
    Request.player_index = player_index;
    function belongings(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (belongings)');
            return;
        }
        updates_1.SendUpdate.belongings(user);
    }
    Request.belongings = belongings;
    function flee_chance(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return;
        }
        alerts_1.Alerts.battle_action_chance(user, 'flee', VALUES_1.BattleValues.flee_chance(character.position));
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
    //     const battle = Data.Battles.from_id(battle_id);
    //     const unit = Convert.character_to_unit(character)
    //     if (unit == undefined) {return}
    //     for (let [key, item] of Object.entries(ActionsSelf)) {
    //         const result: BattleActionData = {
    //             name: key,
    //             tag: key,
    //             cost: item.ap_cost(battle, character),
    //             damage: 0,
    //             probability: item.chance(battle, character),
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
        const battle = data_objects_1.Data.Battles.from_id(battle_id);
        for (let [key, item] of Object.entries(actions_1.ActionsSelf)) {
            const result = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character),
                damage: 0,
                probability: item.chance(battle, character),
                target: 'self',
                possible: (0, actions_1.battle_action_self_check)(key, battle, character, 0).response == 'OK'
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
        const battle = data_objects_1.Data.Battles.from_id(battle_id);
        const target_character = heap_1.CharactersHeap.get_unit(battle, target_id);
        if (target_character == undefined)
            return;
        for (let [key, item] of Object.entries(actions_1.ActionsUnit)) {
            const result = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, target_character),
                damage: item.damage(battle, character, target_character),
                probability: item.chance(battle, character, target_character),
                target: 'unit',
                possible: (0, actions_1.battle_action_character_check)(key, battle, character, target_character, 0, 0).response == 'OK'
            };
            sw.socket.emit('battle-action-update', result);
        }
    }
    Request.battle_actions_unit = battle_actions_unit;
    function battle(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist (battle)');
            return;
        }
        updates_1.SendUpdate.battle(user);
    }
    Request.battle = battle;
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
        const battle = data_objects_1.Data.Battles.from_id(battle_id);
        for (let [key, item] of Object.entries(actions_1.ActionsPosition)) {
            const result = {
                name: key,
                tag: key,
                cost: item.ap_cost(battle, character, target),
                damage: 0,
                probability: 1,
                target: 'position',
                possible: (0, actions_1.battle_action_position_check)(key, battle, character, target).response == 'OK'
            };
            sw.socket.emit('battle-action-update', result);
        }
    }
    Request.battle_actions_position = battle_actions_position;
    function craft_data(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (user == undefined) {
            sw.socket.emit('alert', 'user does not exist');
            return;
        }
        updates_1.SendUpdate.all_craft(user);
    }
    Request.craft_data = craft_data;
})(Request = exports.Request || (exports.Request = {}));
