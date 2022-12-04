"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const battle_calcs_1 = require("../../battle/battle_calcs");
const skills_1 = require("../../character/skills");
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
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
        for (let perk of skills_1.perks_list) {
            if (data[perk] == true) {
                responce[perk] = (0, skills_1.perk_price)(perk, character, target_character);
            }
        }
        sw.socket.emit('perks-info', responce);
    }
    Request.perks = perks;
})(Request = exports.Request || (exports.Request = {}));
