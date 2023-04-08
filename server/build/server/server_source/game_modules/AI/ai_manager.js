"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignAI = void 0;
const helpers_1 = require("./helpers");
const AI_ROUTINE_RAT_HUNT_1 = require("./AI_ROUTINE_RAT_HUNT");
const AI_ROUTINE_RAT_1 = require("./AI_ROUTINE_RAT");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const AI_ROUTINE_CRAFTER_1 = require("./AI_ROUTINE_CRAFTER");
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
        let responce = helpers_1.AIhelper.check_battles_to_join(character);
        if (responce)
            return;
        if (character.race() == 'rat') {
            (0, AI_ROUTINE_RAT_1.RatRoutine)(character);
            return;
        }
        switch (character.archetype.ai_map) {
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
                (0, AI_ROUTINE_RAT_HUNT_1.RatHunterRoutine)(character);
                break;
            }
        }
        if (character.archetype.ai_map == 'dummy') {
            (0, AI_ROUTINE_CRAFTER_1.crafter_routine)(character);
        }
    }
    CampaignAI.decision = decision;
})(CampaignAI = exports.CampaignAI || (exports.CampaignAI = {}));
