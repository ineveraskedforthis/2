"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketCommand = void 0;
const events_1 = require("../../events/events");
const systems_communication_1 = require("../../systems_communication");
const common_validations_1 = require("./common_validations");
const content_1 = require("../../../.././../game_content/src/content");
const system_1 = require("../../battle/system");
const data_objects_1 = require("../../data/data_objects");
const effects_1 = require("../../effects/effects");
const character_1 = require("../../scripted-values/character");
const request_1 = require("./request");
var SocketCommand;
(function (SocketCommand) {
    // data is a raw id of character
    function attack_character(socket_wrapper, raw_data) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(socket_wrapper);
        const [valid_user, valid_character, target] = common_validations_1.Validator.valid_action_to_character(user, character, raw_data);
        if (target == undefined)
            return;
        if (target.dead())
            return;
        console.log('attack_character ' + raw_data);
        system_1.BattleSystem.start_battle(valid_character, target);
    }
    SocketCommand.attack_character = attack_character;
    function rob_character(socket_wrapper, raw_data) {
        console.log('rob_character ' + raw_data);
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(socket_wrapper);
        const [valid_user, valid_character, target] = common_validations_1.Validator.valid_action_to_character(user, character, raw_data);
        if (target == undefined)
            return;
        events_1.Event.rob_the_dead(valid_character, target);
    }
    SocketCommand.rob_character = rob_character;
    function support_character(socket_wrapper, raw_data) {
        console.log('support_character ' + raw_data);
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(socket_wrapper);
        const [valid_user, valid_character, target] = common_validations_1.Validator.valid_action_to_character(user, character, raw_data);
        if (target == undefined)
            return;
        if (target.dead())
            return;
        system_1.BattleSystem.support_in_battle(valid_character, target);
    }
    SocketCommand.support_character = support_character;
    function learn_perk(sw, msg) {
        if (msg == undefined)
            return;
        let character_id = msg.id;
        let perk_tag = msg.tag;
        if (typeof perk_tag != 'number')
            return;
        if (!content_1.PerkConfiguration.is_valid_id(perk_tag))
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        const [valid_user, valid_character, target_character] = common_validations_1.Validator.valid_action_to_character(user, character, character_id);
        if (target_character == undefined)
            return;
        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell');
            return;
        }
        if (!character_1.CharacterValues.perk(target_character, perk_tag)) {
            valid_user.socket.emit('alert', "target doesn't know this perk");
            return;
        }
        if (character_1.CharacterValues.perk(valid_character, perk_tag)) {
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
        if (typeof skill_tag != 'number')
            return;
        if (!content_1.SkillConfiguration.is_valid_id(skill_tag))
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        const [valid_user, valid_character, target_character] = common_validations_1.Validator.valid_action_to_character(user, character, character_id);
        if (target_character == undefined)
            return;
        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell');
            return;
        }
        if (valid_character._skills[skill_tag] == undefined) {
            return;
        }
        // console.log('validation passed')
        events_1.Event.buy_skill(valid_character, skill_tag, target_character);
    }
    SocketCommand.learn_skill = learn_skill;
    function enter_location(sw, msg) {
        if (msg == undefined)
            return;
        let location_id = Number(msg);
        if (typeof (location_id) != "number") {
            return;
        }
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined) {
            return;
        }
        const location = data_objects_1.Data.Locations.from_number(location_id);
        if (location == undefined)
            return false;
        if (location.cell_id != character.cell_id)
            return false;
        effects_1.Effect.enter_location(character.id, location.id);
        request_1.Request.local_locations(sw);
    }
    SocketCommand.enter_location = enter_location;
    // export function create_plot(sw: SocketWrapper) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return
    //     Event.create_land_plot(character)
    //     Request.local_locations(sw)
    // }
    // export function develop_plot(sw: SocketWrapper, msg: undefined|{id: unknown, type: unknown}) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return
    //     if (msg == undefined) return
    //     let location_id = msg.id
    //     if (typeof location_id != 'number') return
    //     let location = Data.Locations.from_id(location_id as location_id)
    //     if (location == undefined) return
    //     let type = msg.type
    //     if (type == undefined) return
    //     let true_type = LandPlotType.Shack
    //     if (type == LandPlotType.HumanHouse) true_type = LandPlotType.HumanHouse
    //     if (type == LandPlotType.Inn) true_type = LandPlotType.Inn
    //     if (type == LandPlotType.CottonField) true_type = LandPlotType.CottonField
    //     Event.develop_land_plot(character, location_id as location_id, true_type)
    //     Request.local_locations(sw)
    // }
    // export function change_rent_price(sw: SocketWrapper, msg: undefined|{id: unknown, price: unknown}) {
    //     console.log('change rent price', msg)
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return
    //     if (msg == undefined) return
    //     let location_id = msg.id
    //     if (typeof location_id != 'number') return
    //     let location = Data.Locations.from_id(location_id as location_id)
    //     if (location == undefined) return
    //     let price = msg.price
    //     if (typeof price != 'number') return
    //     console.log('change rent price', character.name, location, price)
    //     Event.change_rent_price(character, location_id as location_id, price as money)
    //     Request.local_locations(sw)
    // }
    function repair_location(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (msg == undefined)
            return;
        let location_id = msg.id;
        if (typeof location_id != 'number')
            return;
        let location = data_objects_1.Data.Locations.from_number(location_id);
        if (location == undefined)
            return;
        events_1.Event.repair_location(character, location_id);
        request_1.Request.local_locations(sw);
    }
    SocketCommand.repair_location = repair_location;
})(SocketCommand || (exports.SocketCommand = SocketCommand = {}));

