"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decide = void 0;
const data_objects_1 = require("../../data/data_objects");
const storage_1 = require("../Storage/storage");
require("../Actions/_loader");
function decide() {
    data_objects_1.Data.Characters.for_each((character) => {
        if (character.dead())
            return;
        if (character.is_player())
            return;
        if (character.in_battle())
            return;
        if (character.action != undefined)
            return;
        // console.log("decide", character.name)
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
            best.action(character, best.target);
            character.current_ai_action = best.tag;
        }
    });
}
exports.decide = decide;
