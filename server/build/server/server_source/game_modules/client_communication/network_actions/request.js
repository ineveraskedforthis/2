"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const system_1 = require("../../attack/system");
const battle_calcs_1 = require("../../battle/battle_calcs");
const events_1 = require("../../battle/events");
const Perks_1 = require("../../character/Perks");
const damage_types_1 = require("../../misc/damage_types");
const constants_1 = require("../../static_data/constants");
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
const updates_1 = require("./updates");
var Request;
(function (Request) {
    function accuracy(sw, distance) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        // console.log('request accuracy ' + distance)
        if (character == undefined)
            return;
        if (!user.logged_in) {
            return;
        }
        if (isNaN(distance)) {
            // console.log('not_a_number')
            return;
        }
        const acc = battle_calcs_1.Accuracy.ranged(character, distance);
        // console.log(acc)
        alerts_1.Alerts.battle_action_chance(user, 'shoot', acc);
        let magic_bolt = damage_types_1.DmgOps.total(system_1.Attack.generate_magic_bolt(character, distance).damage);
        alerts_1.Alerts.battle_action_damage(user, 'magic_bolt', magic_bolt);
    }
    Request.accuracy = accuracy;
    function perks(sw, character_id) {
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
        let data = target_character.perks;
        let responce = {};
        for (let perk of Perks_1.perks_list) {
            if (data[perk] == true) {
                responce[perk] = (0, Perks_1.perk_price)(perk, character, target_character);
            }
        }
        sw.socket.emit('perks-info', responce);
    }
    Request.perks = perks;
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
        alerts_1.Alerts.battle_action_chance(user, 'flee', events_1.BattleEvent.flee_chance(unit.position));
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
})(Request = exports.Request || (exports.Request = {}));
