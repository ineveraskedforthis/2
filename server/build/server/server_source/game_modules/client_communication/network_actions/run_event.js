"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketCommand = void 0;
const data_1 = require("../../data");
const effects_1 = require("../../events/effects");
const events_1 = require("../../events/events");
const systems_communication_1 = require("../../systems_communication");
const common_validations_1 = require("./common_validations");
const system_1 = require("../../battle/system");
const system_2 = require("../../character/system");
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
        if (!system_2.CharacterSystem.perk(target_character, perk_tag)) {
            valid_user.socket.emit('alert', "target doesn't know this perk");
            return;
        }
        if (system_2.CharacterSystem.perk(valid_character, perk_tag)) {
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
        if (valid_character._skills[skill_tag] == undefined) {
            return;
        }
        // console.log('validation passed')
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
    function leave_room(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        effects_1.Effect.leave_room(character.id);
    }
    SocketCommand.leave_room = leave_room;
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
        console.log('attempt to buy plot', character?.id, target_character?.id);
        if (character == undefined)
            return;
        if (target_character == undefined)
            return;
        if (valid_character.cell_id != target_character.cell_id) {
            valid_user.socket.emit('alert', 'not in the same cell');
            return;
        }
        let response = events_1.Event.buy_land_plot(character, target_character);
        console.log(response);
    }
    SocketCommand.buy_plot = buy_plot;
    function create_plot(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        events_1.Event.create_land_plot(character);
        request_1.Request.local_buildings(sw);
    }
    SocketCommand.create_plot = create_plot;
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
        request_1.Request.local_buildings(sw);
    }
    SocketCommand.develop_plot = develop_plot;
    function change_rent_price(sw, msg) {
        console.log('change rent price', msg);
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
        let price = msg.price;
        if (typeof price != 'number')
            return;
        console.log('change rent price', character.name, building, price);
        events_1.Event.change_rent_price(character, building_id, price);
        request_1.Request.local_buildings(sw);
    }
    SocketCommand.change_rent_price = change_rent_price;
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
        request_1.Request.local_buildings(sw);
    }
    SocketCommand.repair_building = repair_building;
})(SocketCommand = exports.SocketCommand || (exports.SocketCommand = {}));
