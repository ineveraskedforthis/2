"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = exports.CharacterAction = void 0;
const move_1 = require("./actions_set_up/character_actions/move");
const eat_1 = require("./actions_set_up/character_actions/eat");
const cook_meat_1 = require("./actions_set_up/character_actions/cook_meat");
const clean_1 = require("./actions_set_up/character_actions/clean");
const rest_1 = require("./actions_set_up/character_actions/rest");
const hunt_1 = require("./actions_set_up/character_actions/hunt");
const attack_1 = require("./actions_set_up/character_actions/attack");
const craft_spear_1 = require("./actions_set_up/character_actions/craft_spear");
const gather_wood_1 = require("./actions_set_up/character_actions/gather_wood");
const craft_bone_spear_1 = require("./actions_set_up/character_actions/craft_bone_spear");
const craft_rat_armour_1 = require("./actions_set_up/character_actions/craft_rat_armour");
const alerts_1 = require("../client_communication/network_actions/alerts");
var CharacterAction;
(function (CharacterAction) {
    CharacterAction.MOVE = move_1.move;
    CharacterAction.CLEAN = clean_1.clean;
    CharacterAction.EAT = eat_1.eat;
    CharacterAction.HUNT = hunt_1.hunt;
    CharacterAction.REST = rest_1.rest;
    CharacterAction.ATTACK = attack_1.attack;
    CharacterAction.GATHER_WOOD = gather_wood_1.gather_wood;
    let COOK;
    (function (COOK) {
        COOK.MEAT = cook_meat_1.cook_meat;
        COOK.ELODINO = cook_meat_1.cook_elo_to_zaz;
    })(COOK = CharacterAction.COOK || (CharacterAction.COOK = {}));
    let CRAFT;
    (function (CRAFT) {
        CRAFT.BONE_SPEAR = craft_bone_spear_1.craft_bone_spear;
        CRAFT.SPEAR = craft_spear_1.craft_spear;
        CRAFT.RAT_PANTS = craft_rat_armour_1.craft_rat_pants;
        CRAFT.RAT_ARMOUR = craft_rat_armour_1.craft_rat_armour;
        CRAFT.RAT_GLOVES = craft_rat_armour_1.craft_rat_gloves;
        CRAFT.RAT_HELMET = craft_rat_armour_1.craft_rat_helmet;
        CRAFT.RAT_BOOTS = craft_rat_armour_1.craft_rat_boots;
        CRAFT.WOOD_BOW = craft_bone_spear_1.craft_wood_bow;
        CRAFT.BONE_ARROW = craft_bone_spear_1.craft_bone_arrow;
    })(CRAFT = CharacterAction.CRAFT || (CharacterAction.CRAFT = {}));
})(CharacterAction = exports.CharacterAction || (exports.CharacterAction = {}));
var ActionManager;
(function (ActionManager) {
    function start_action_targeted(action, char, data) {
        if (char.action != undefined) {
            return 5 /* CharacterActionResponce.ALREADY_IN_ACTION */;
        }
        let check = action.check(char, data);
        if (check == 1 /* CharacterActionResponce.OK */) {
            let duration = action.duration(char);
            alerts_1.Alerts.action_ping(char, duration, action.is_move || false);
            if (action.immediate) {
                action_targeted(action, char, data);
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
    ActionManager.start_action_targeted = start_action_targeted;
    function action_targeted(action, char, data) {
        char.action = undefined;
        char.action_duration = 0;
        char.action_progress = 0;
        let check = action.check(char, data);
        if (check == 1 /* CharacterActionResponce.OK */) {
            return action.result(char, data);
        }
        return check;
    }
})(ActionManager = exports.ActionManager || (exports.ActionManager = {}));
