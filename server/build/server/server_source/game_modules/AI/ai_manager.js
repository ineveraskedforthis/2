"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignAI = void 0;
const helpers_1 = require("./helpers");
const AI_ROUTINE_RAT_1 = require("./AI_ROUTINE_RAT");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const AI_ROUTINE_CRAFTER_1 = require("./AI_ROUTINE_CRAFTER");
const AI_ROUTINE_URBAN_TRADER_1 = require("./AI_ROUTINE_URBAN_TRADER");
const AI_ROUTINE_GUARD_1 = require("./AI_ROUTINE_GUARD");
const triggers_1 = require("./triggers");
const AI_ROUTINE_UTILITY_1 = require("./AI_ROUTINE_UTILITY");
var CampaignAI;
(function (CampaignAI) {
    function decision(character) {
        // console.log(character.misc.ai_tag)
        if (character.is_player()) {
            return;
        }
        if (character.in_battle()) {
            return;
        }
        if (character.action != undefined) {
            return;
        }
        if (Math.random() < 0.1) {
            character.ai_memories.shift();
        }
        if (!(0, triggers_1.low_hp)(character)) {
            let responce = helpers_1.AIhelper.check_battles_to_join(character);
            if (responce)
                return;
        }
        if (character.race == 'rat') {
            (0, AI_ROUTINE_RAT_1.RatRoutine)(character);
            return;
        }
        // console.log(character.archetype.ai_map)
        switch (character.ai_map) {
            case "steppe_walker_agressive": {
                (0, AI_ROUTINE_GENERIC_1.SteppeAgressiveRoutine)(character);
                break;
            }
            case "dummy": {
                break;
            }
            case "steppe_walker_passive": {
                (0, AI_ROUTINE_GENERIC_1.SteppePassiveRoutine)(character);
                break;
            }
            case "forest_walker": {
                (0, AI_ROUTINE_GENERIC_1.ForestPassiveRoutine)(character);
                break;
            }
            case "rat_hunter": {
                (0, AI_ROUTINE_UTILITY_1.rat_hunter_decision)(character);
                break;
            }
            case "urban_trader": {
                (0, AI_ROUTINE_URBAN_TRADER_1.TraderRoutine)(character);
                break;
            }
            case "urban_guard": {
                (0, AI_ROUTINE_GUARD_1.GuardUrbanRoutine)(character);
                break;
            }
        }
        if (character.ai_map == 'dummy') {
            (0, AI_ROUTINE_CRAFTER_1.crafter_routine)(character);
        }
    }
    CampaignAI.decision = decision;
})(CampaignAI = exports.CampaignAI || (exports.CampaignAI = {}));
