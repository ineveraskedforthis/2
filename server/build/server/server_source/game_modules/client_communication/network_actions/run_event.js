"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketCommand = void 0;
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
    function learn_perk(sw, character_id, perk_tag) {
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
})(SocketCommand = exports.SocketCommand || (exports.SocketCommand = {}));
