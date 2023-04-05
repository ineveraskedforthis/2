"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignAI = void 0;
const action_manager_1 = require("../actions/action_manager");
const action_types_1 = require("../action_types");
const materials_manager_1 = require("../manager_classes/materials_manager");
const helpers_1 = require("./helpers");
const cooking_1 = require("../craft/cooking");
const ammunition_1 = require("../craft/ammunition");
const AI_ROUTINE_RAT_HUNT_1 = require("./AI_ROUTINE_RAT_HUNT");
const AIactions_1 = require("./AIactions");
const AI_ROUTINE_RAT_1 = require("./AI_ROUTINE_RAT");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const triggers_1 = require("./triggers");
var CampaignAI;
(function (CampaignAI) {
    function decision(char) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return;
        }
        if (char.in_battle()) {
            return;
        }
        if (char.action != undefined) {
            return;
        }
        let responce = helpers_1.AIhelper.check_battles_to_join(char);
        if (responce)
            return;
        if (char.race() == 'rat') {
            (0, AI_ROUTINE_RAT_1.RatRoutine)(char);
            return;
        }
        switch (char.archetype.ai_map) {
            case "steppe_walker_agressive": {
                (0, AI_ROUTINE_GENERIC_1.SteppeAgressiveRoutine)(char);
                break;
            }
            case "dummy": {
                break;
            }
            case "steppe_walker_passive": {
                (0, AI_ROUTINE_GENERIC_1.SteppePassiveRoutine)(char);
                break;
            }
            case "forest_walker": {
                (0, AI_ROUTINE_GENERIC_1.ForestPassiveRoutine)(char);
                break;
            }
            case "rat_hunter": {
                (0, AI_ROUTINE_RAT_HUNT_1.RatHunterRoutine)(char);
                break;
            }
        }
        if ((0, triggers_1.tired)(char)) {
            action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, char, [0, 0]);
            return;
        }
        decide_craft(char);
    }
    CampaignAI.decision = decision;
    function decide_craft(char) {
        if ((char.skills.cooking > 40) || (char.perks.meat_master == true)) {
            AIactions_1.AIactions.craft_bulk(char, cooking_1.Cooking.meat);
        }
        if ((char.skills.woodwork > 40) && (char.perks.fletcher == true)) {
            AIactions_1.AIactions.craft_bulk(char, ammunition_1.AmmunitionCraft.bone_arrow);
        }
        if ((char.perks.alchemist)) {
            AIactions_1.AIactions.craft_bulk(char, cooking_1.Cooking.elodino);
        }
        if ((char.skills.woodwork > 40) && (char.perks.weapon_maker == true)) {
            AIactions_1.AIactions.make_wooden_weapon(char, (0, helpers_1.base_price)(char, materials_manager_1.WOOD));
        }
        if ((char.skills.bone_carving > 40) && (char.perks.weapon_maker == true)) {
            AIactions_1.AIactions.make_bone_weapon(char, (0, helpers_1.base_price)(char, materials_manager_1.RAT_BONE));
        }
        if ((char.skills.clothier > 40) && (char.perks.skin_armour_master == true)) {
            AIactions_1.AIactions.make_armour(char, (0, helpers_1.base_price)(char, materials_manager_1.RAT_SKIN));
        }
        if ((char.skills.clothier > 40) && (char.perks.shoemaker == true)) {
            AIactions_1.AIactions.make_boots(char, (0, helpers_1.base_price)(char, materials_manager_1.RAT_SKIN));
        }
    }
})(CampaignAI = exports.CampaignAI || (exports.CampaignAI = {}));
