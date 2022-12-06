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
        if (user == undefined)
            return;
        if (!common_validations_1.Validator.can_act(user, character)) {
            return;
        }
        console.log('user is valid');
        const data = Number(raw_data);
        const target_character = systems_communication_1.Convert.number_to_character(data);
        if (target_character == undefined)
            return;
        console.log('target ccharacter is vaalid');
        events_1.Event.start_battle(character, target_character);
    }
    SocketCommand.attack_character = attack_character;
    function learn_perk(sw, character_id, perk_tag) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        const data = Number(character_id);
        const target_character = systems_communication_1.Convert.number_to_character(data);
        if (target_character == undefined)
            return;
        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell');
            return;
        }
        if (target_character.perks[perk_tag] != true) {
            user.socket.emit('alert', "target doesn't know this perk");
            return;
        }
        if (character.perks[perk_tag] == true) {
            user.socket.emit('alert', "you already know it");
            return;
        }
        events_1.Event.buy_perk(character, perk_tag, target_character);
    }
    SocketCommand.learn_perk = learn_perk;
})(SocketCommand = exports.SocketCommand || (exports.SocketCommand = {}));
