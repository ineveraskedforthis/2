"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = void 0;
const systems_communication_1 = require("../../systems_communication");
const perk_base_price_1 = require("../../prices/perk_base_price");
const data_1 = require("../../data");
const triggers_1 = require("../../events/triggers");
const system_1 = require("../../character/system");
const skill_price_1 = require("../../prices/skill_price");
const SYSTEM_REPUTATION_1 = require("../../SYSTEM_REPUTATION");
var Dialog;
(function (Dialog) {
    function talking_check(sw, character_id) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (typeof character_id != 'number') {
            sw.socket.emit('alert', 'invalid character id');
            return [undefined, undefined];
        }
        if (character == undefined) {
            sw.socket.emit('alert', 'your character does not exist');
            return [undefined, undefined];
        }
        let target_character = systems_communication_1.Convert.id_to_character(character_id);
        if (target_character == undefined) {
            sw.socket.emit('alert', 'character does not exist');
            return [undefined, undefined];
        }
        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell');
            return [undefined, undefined];
        }
        if (character_id == character.id) {
            user.socket.emit('alert', "can't talk with yourself");
            return [undefined, undefined];
        }
        if (!(0, SYSTEM_REPUTATION_1.can_talk)(character, target_character)) {
            user.socket.emit('alert', "can't talk with enemies or creatures of different race");
            return [undefined, undefined];
        }
        return [character, target_character];
    }
    function request_prices(sw, character_id) {
        const [character, target_character] = talking_check(sw, character_id);
        if ((character == undefined || target_character == undefined)) {
            return;
        }
        let data_buy = Object.fromEntries(target_character.ai_price_belief_buy);
        let data_sell = Object.fromEntries(target_character.ai_price_belief_sell);
        // console.log(data_buy, data_sell)
        sw.socket.emit('character-prices', { buy: data_buy, sell: data_sell });
    }
    Dialog.request_prices = request_prices;
    function request_greeting(sw, character_id) {
        const [character, target_character] = talking_check(sw, character_id);
        if ((character == undefined || target_character == undefined)) {
            return;
        }
        // if (target_character.dead()) return
        let data = target_character._perks;
        let response = {
            name: target_character.get_name(),
            race: target_character.race,
            factions: data_1.Data.Reputation.list_from_id(target_character.id),
            current_goal: target_character.ai_state,
            perks: {},
            skills: {},
            model: target_character.model,
            equip: target_character.equip_models()
        };
        for (let perk of Object.keys(data)) {
            if (data[perk] == true) {
                response.perks[perk] = (0, perk_base_price_1.perk_price)(perk, character, target_character);
            }
        }
        for (let skill of Object.keys(target_character._skills)) {
            let teaching_response = triggers_1.Trigger.can_learn_from(character, target_character, skill);
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
    Dialog.request_greeting = request_greeting;
})(Dialog = exports.Dialog || (exports.Dialog = {}));
