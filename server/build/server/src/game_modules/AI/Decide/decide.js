"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decide = void 0;
const storage_1 = require("../Storage/storage");
require("../Actions/_loader");
function decide(character) {
    if (character.dead())
        return;
    // if (character.is_player()) return;
    if (character.in_battle())
        return;
    if (character.action != undefined)
        return;
    let best;
    for (const item of storage_1.AIActionsStorage.actions) {
        const targets = item.potential_targets(character);
        for (const target of targets) {
            const utility = item.utility(character, target);
            if ((best == undefined) || best.utility < utility) {
                best = {
                    tag: item.tag,
                    target: target,
                    utility: utility,
                    action: item.action
                };
            }
        }
    }
    if (best) {
        // if (character.user_id !== undefined) {
        //     console.log(best.tag, best.utility)
        // }
        best.action(character, best.target);
        character.current_ai_action = best.tag + " " + best.target.id;
    }
}
exports.decide = decide;
