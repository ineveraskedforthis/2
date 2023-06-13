"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketCommand = void 0;
const data_1 = require("../../data");
const effects_1 = require("../../events/effects");
const events_1 = require("../../events/events");
const systems_communication_1 = require("../../systems_communication");
const common_validations_1 = require("./common_validations");
var SocketCommand;
(function (SocketCommand) {
    // data is a raw id of character
    function attack_character(socket_wrapper, raw_data) {
        console.log('attack_character ' + raw_data);
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(socket_wrapper);
        const [valid_user, valid_character, target] = common_validations_1.Validator.valid_action_to_character(user, character, raw_data);
        if (target == undefined)
            return;
        events_1.Event.start_battle(valid_character, target);
    }
    SocketCommand.attack_character = attack_character;
    function support_character(socket_wrapper, raw_data) {
        console.log('support_character ' + raw_data);
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(socket_wrapper);
        const [valid_user, valid_character, target] = common_validations_1.Validator.valid_action_to_character(user, character, raw_data);
        if (target == undefined)
            return;
        events_1.Event.support_in_battle(valid_character, target);
    }
    SocketCommand.support_character = support_character;
    function learn_perk(sw, msg) {
        if (msg == undefined)
            return;
        let character_id = msg.id;
        let perk_tag = msg.tag;
        if (typeof perk_tag != 'string')
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        const [valid_user, valid_character, target_character] = common_validations_1.Validator.valid_action_to_character(user, character, character_id);
        if (target_character == undefined)
            return;
        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell');
            return;
        }
        if (target_character.perks[perk_tag] != true) {
            valid_user.socket.emit('alert', "target doesn't know this perk");
            return;
        }
        if (valid_character.perks[perk_tag] == true) {
            valid_user.socket.emit('alert', "you already know it");
            return;
        }
        events_1.Event.buy_perk(valid_character, perk_tag, target_character);
    }
    SocketCommand.learn_perk = learn_perk;
    function learn_skill(sw, msg) {
        if (msg == undefined)
            return;
        let character_id = msg.id;
        let skill_tag = msg.tag;
        if (typeof skill_tag != 'string')
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        const [valid_user, valid_character, target_character] = common_validations_1.Validator.valid_action_to_character(user, character, character_id);
        if (target_character == undefined)
            return;
        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell');
            return;
        }
        if (valid_character.skills[skill_tag] == undefined) {
            return;
        }
        events_1.Event.buy_skill(valid_character, skill_tag, target_character);
    }
    SocketCommand.learn_skill = learn_skill;
    function rent_room(sw, msg) {
        if (msg == undefined)
            return;
        let building_id = msg.id;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (typeof building_id != 'number')
            return;
        let building = data_1.Data.Buildings.from_id(building_id);
        if (building == undefined)
            return;
        let responce = effects_1.Effect.rent_room(character.id, building_id);
    }
    SocketCommand.rent_room = rent_room;
    function validate_building_type(msg) {
        switch (msg) {
            case ("elodino_house" /* LandPlotType.ElodinoHouse */): return true;
            case ("human_house" /* LandPlotType.HumanHouse */): return true;
            case ("inn" /* LandPlotType.Inn */): return true;
            case ("rat_lair" /* LandPlotType.RatLair */): return true;
            case ("shack" /* LandPlotType.Shack */): return true;
        }
        return false;
    }
    // export function build_building(sw: SocketWrapper, msg: unknown) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return
    //     if (typeof msg != 'string') return
    //     if (!validate_building_type(msg)) return true
    //     // Event.build_building(character, msg as LandPlotType)
    // }
    function buy_plot(sw, msg) {
        if (msg == undefined)
            return;
        let character_id = msg.id;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        const [valid_user, valid_character, target_character] = common_validations_1.Validator.valid_action_to_character(user, character, character_id);
        if (character == undefined)
            return;
        if (target_character == undefined)
            return;
        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell');
            return;
        }
        events_1.Event.buy_land_plot(character, target_character);
    }
    SocketCommand.buy_plot = buy_plot;
    function develop_plot(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (msg == undefined)
            return;
        let building_id = msg.id;
        if (typeof building_id != 'number')
            return;
        let building = data_1.Data.Buildings.from_id(building_id);
        if (building == undefined)
            return;
        let type = msg.type;
        if (type == undefined)
            return;
        let true_type = "shack" /* LandPlotType.Shack */;
        if (type == "human_house" /* LandPlotType.HumanHouse */)
            true_type = "human_house" /* LandPlotType.HumanHouse */;
        if (type == "inn" /* LandPlotType.Inn */)
            true_type = "inn" /* LandPlotType.Inn */;
        if (type == "cotton_field" /* LandPlotType.CottonField */)
            true_type = "cotton_field" /* LandPlotType.CottonField */;
        events_1.Event.develop_land_plot(character, building_id, true_type);
    }
    SocketCommand.develop_plot = develop_plot;
    function repair_building(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (msg == undefined)
            return;
        let building_id = msg.id;
        if (typeof building_id != 'number')
            return;
        let building = data_1.Data.Buildings.from_id(building_id);
        if (building == undefined)
            return;
        events_1.Event.repair_building(character, building_id);
    }
    SocketCommand.repair_building = repair_building;
})(SocketCommand = exports.SocketCommand || (exports.SocketCommand = {}));
