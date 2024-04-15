"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decide_ai_action_campaign = void 0;
const ACTIONS_UTILITY_1 = require("./ACTIONS_UTILITY");
function decide_ai_action_campaign(character) {
    let best_utility = 0;
    let best_action = (character) => undefined;
    for (let item of Object.values(ACTIONS_UTILITY_1.AI_ACTIONS)) {
        const utility = item.utility(character);
        if (utility > best_utility) {
            best_utility = utility;
            best_action = item.action;
        }
    }
    best_action(character);
}
exports.decide_ai_action_campaign = decide_ai_action_campaign;
