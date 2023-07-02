"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignAI = void 0;
const helpers_1 = require("./helpers");
const ACTIONS_DECISION_1 = require("./ACTIONS_DECISION");
const AI_TRIGGERS_1 = require("./AI_TRIGGERS");
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
        if (!AI_TRIGGERS_1.AI_TRIGGER.low_hp(character)) {
            let responce = helpers_1.AIhelper.check_battles_to_join(character);
            if (responce)
                return;
        }
        (0, ACTIONS_DECISION_1.decide_ai_action_campaign)(character);
    }
    CampaignAI.decision = decision;
})(CampaignAI = exports.CampaignAI || (exports.CampaignAI = {}));
