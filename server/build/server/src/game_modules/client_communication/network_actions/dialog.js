"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = void 0;
const systems_communication_1 = require("../../systems_communication");
const perk_base_price_1 = require("../../prices/perk_base_price");
const triggers_1 = require("../../events/triggers");
const skill_price_1 = require("../../prices/skill_price");
const SYSTEM_REPUTATION_1 = require("../../SYSTEM_REPUTATION");
const data_objects_1 = require("../../data/data_objects");
const data_id_1 = require("../../data/data_id");
const extract_data_1 = require("../../data-extraction/extract-data");
const character_1 = require("../../scripted-values/character");
const content_1 = require("../../../.././../game_content/src/content");
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
        let target_character = data_objects_1.Data.Characters.from_number(character_id);
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
        let buy = target_character.ai_price_buy_expectation;
        let sell = target_character.ai_price_sell_expectation;
        let buy_precision = target_character.ai_price_buy_log_precision;
        let sell_precision = target_character.ai_price_sell_log_precision;
        sw.socket.emit('character-prices', {
            buy: buy,
            sell: sell,
            buy_log_precision: buy_precision,
            sell_log_precision: sell_precision
        });
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
            factions: data_id_1.DataID.Reputation.character(target_character.id).map(systems_communication_1.Convert.reputation_to_socket),
            current_goal: target_character.current_ai_action,
            perks: [],
            skills: [],
            model: target_character.model,
            equip: extract_data_1.Extract.CharacterEquipModel(target_character)
        };
        for (let perk of content_1.PerkConfiguration.PERK) {
            if (data[perk]) {
                response.perks[perk] = (0, perk_base_price_1.perk_price)(perk, character, target_character);
            }
        }
        for (let skill of content_1.SkillConfiguration.SKILL) {
            let teaching_response = triggers_1.Trigger.can_learn_from(character, target_character, skill);
            if (teaching_response.response == 'ok' || teaching_response.response == triggers_1.ResponseNegativeQuantified.Money) {
                const teacher_skill = character_1.CharacterValues.skill(target_character, skill);
                response.skills[skill] = [
                    teacher_skill,
                    (0, skill_price_1.skill_price)(skill, character, target_character)
                ];
            }
        }
        sw.socket.emit('perks-info', response);
    }
    Dialog.request_greeting = request_greeting;
})(Dialog || (exports.Dialog = Dialog = {}));

