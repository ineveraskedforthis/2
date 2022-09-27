"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = exports.CharacterAction = void 0;
const move_1 = require("./actions_set_up/character_actions/move");
// import { eat } from "./actions_set_up/character_actions/eat"
// import { cook_elo_to_zaz, cook_meat } from "./actions_set_up/character_actions/cook_meat"
// import { clean } from './actions_set_up/character_actions/clean'
// import { rest } from "./actions_set_up/character_actions/rest"
// import { hunt } from "./actions_set_up/character_actions/hunt"
// import { attack } from "./actions_set_up/character_actions/attack"
const craft_spear_1 = require("./actions_set_up/character_actions/craft_spear");
const gather_wood_1 = require("./actions_set_up/character_actions/gather_wood");
// import { craft_bone_arrow, craft_bone_spear, craft_wood_bow } from "./actions_set_up/character_actions/craft_bone_spear"
// import { craft_rat_armour, craft_rat_boots, craft_rat_gloves, craft_rat_helmet, craft_rat_pants } from "./actions_set_up/character_actions/craft_rat_armour"
// import { cell_id } from "../types"
const alerts_1 = require("../client_communication/network_actions/alerts");
const system_1 = require("../base_game_classes/character/system");
var CharacterAction;
(function (CharacterAction) {
    CharacterAction.MOVE = move_1.move;
    // export const CLEAN = clean
    // export const EAT = eat
    // export const HUNT = hunt
    // export const REST = rest
    // export const ATTACK = attack
    CharacterAction.GATHER_WOOD = gather_wood_1.gather_wood;
    // export namespace COOK {
    //     export const MEAT = cook_meat
    //     export const ELODINO = cook_elo_to_zaz
    // }
    let CRAFT;
    (function (CRAFT) {
        //     export const BONE_SPEAR = craft_bone_spear
        CRAFT.SPEAR = craft_spear_1.craft_spear;
        //     export const RAT_PANTS = craft_rat_pants
        //     export const RAT_ARMOUR = craft_rat_armour
        //     export const RAT_GLOVES = craft_rat_gloves
        //     export const RAT_HELMET = craft_rat_helmet
        //     export const RAT_BOOTS = craft_rat_boots
        //     export const WOOD_BOW = craft_wood_bow
        //     export const BONE_ARROW = craft_bone_arrow
    })(CRAFT = CharacterAction.CRAFT || (CharacterAction.CRAFT = {}));
})(CharacterAction = exports.CharacterAction || (exports.CharacterAction = {}));
var ActionManager;
(function (ActionManager) {
    function start_action(action, char, data) {
        if (char.action != undefined) {
            return 5 /* CharacterActionResponce.ALREADY_IN_ACTION */;
        }
        let check = action.check(char, data);
        if (check == 1 /* CharacterActionResponce.OK */) {
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
        for (let character of system_1.character_list) {
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
