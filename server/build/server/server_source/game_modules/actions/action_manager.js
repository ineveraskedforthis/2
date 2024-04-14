"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = exports.dummy_start = exports.dummy_duration = void 0;
// import { attack } from "./attack"
const alerts_1 = require("../client_communication/network_actions/alerts");
const data_1 = require("../data");
function dummy_duration(char) {
    return 0.5;
}
exports.dummy_duration = dummy_duration;
function dummy_start(char) { }
exports.dummy_start = dummy_start;
var ActionManager;
(function (ActionManager) {
    function start_action(action, char, data) {
        if (char.action != undefined) {
            return 5 /* CharacterActionResponce.ALREADY_IN_ACTION */;
        }
        let check = action.check(char, data);
        if (check != 1 /* CharacterActionResponce.OK */) {
            return check;
        }
        let duration = action.duration(char);
        alerts_1.Alerts.action_ping(char, duration, action.is_move || false);
        if (action.immediate) {
            call_action(action, char, data);
        }
        else {
            action.start(char, data);
            char.action = action;
            char.action_progress = 0;
            char.action_duration = duration;
        }
        return check;
    }
    ActionManager.start_action = start_action;
    function call_action(action, char, data) {
        char.action = undefined;
        char.action_duration = 0;
        char.action_progress = 0;
        let check = action.check(char, data);
        if (check == 1 /* CharacterActionResponce.OK */) {
            return action.result(char, data);
        }
        return check;
    }
    ActionManager.call_action = call_action;
    function update_characters(dt) {
        for (let character of data_1.Data.CharacterDB.list()) {
            if (character == undefined)
                continue;
            if (character.action != undefined) {
                character.action_progress += dt;
                if (character.action_progress > character.action_duration) {
                    call_action(character.action, character, character.next_cell);
                }
            }
        }
    }
    ActionManager.update_characters = update_characters;
})(ActionManager = exports.ActionManager || (exports.ActionManager = {}));













































