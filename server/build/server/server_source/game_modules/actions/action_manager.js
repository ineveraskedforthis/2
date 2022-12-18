"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = exports.CharacterAction = void 0;
const move_1 = require("./actions_set_up/character_actions/move");
const eat_1 = require("./actions_set_up/character_actions/eat");
const craft_bulk_1 = require("./actions_set_up/character_actions/craft_bulk");
const clean_1 = require("./actions_set_up/character_actions/clean");
const rest_1 = require("./actions_set_up/character_actions/rest");
const hunt_1 = require("./actions_set_up/character_actions/hunt");
// import { attack } from "./actions_set_up/character_actions/attack"
const gather_1 = require("./actions_set_up/character_actions/gather");
const craft_weapon_1 = require("./actions_set_up/character_actions/craft_weapon");
const craft_bone_arrow_1 = require("./actions_set_up/character_actions/craft_bone_arrow");
const craft_armour_1 = require("./actions_set_up/character_actions/craft_armour");
const alerts_1 = require("../client_communication/network_actions/alerts");
const data_1 = require("../data");
var CharacterAction;
(function (CharacterAction) {
    CharacterAction.MOVE = move_1.move;
    CharacterAction.CLEAN = clean_1.clean;
    CharacterAction.EAT = eat_1.eat;
    CharacterAction.HUNT = hunt_1.hunt;
    CharacterAction.FISH = hunt_1.fish;
    CharacterAction.REST = rest_1.rest;
    // export const ATTACK = attack
    CharacterAction.GATHER_WOOD = gather_1.gather_wood;
    CharacterAction.GATHER_COTTON = gather_1.gather_cotton;
    let COOK;
    (function (COOK) {
        COOK.MEAT = craft_bulk_1.cook_meat;
        COOK.FISH = craft_bulk_1.cook_fish;
        COOK.ELODINO = craft_bulk_1.cook_elo_to_zaz;
    })(COOK = CharacterAction.COOK || (CharacterAction.COOK = {}));
    let CRAFT;
    (function (CRAFT) {
        CRAFT.BONE_SPEAR = craft_weapon_1.craft_bone_spear;
        CRAFT.SPEAR = craft_weapon_1.craft_spear;
        CRAFT.RAT_PANTS = craft_armour_1.craft_rat_pants;
        CRAFT.RAT_ARMOUR = craft_armour_1.craft_rat_armour;
        CRAFT.RAT_GLOVES = craft_armour_1.craft_rat_gloves;
        CRAFT.RAT_HELMET = craft_armour_1.craft_rat_helmet;
        CRAFT.RAT_BOOTS = craft_armour_1.craft_rat_boots;
        CRAFT.WOOD_BOW = craft_weapon_1.craft_wood_bow;
        CRAFT.BONE_ARROW = craft_bone_arrow_1.craft_bone_arrow;
        CRAFT.DAGGER = craft_weapon_1.craft_bone_dagger;
        CRAFT.MACE = craft_weapon_1.craft_wooden_mace;
        CRAFT.SWORD = craft_weapon_1.craft_sword;
        CRAFT.ELO_DRESS = craft_armour_1.craft_elo_dress;
        CRAFT.GRACI_HAIR = craft_armour_1.craft_graci_hair;
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
        for (let character of data_1.Data.Character.list()) {
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
