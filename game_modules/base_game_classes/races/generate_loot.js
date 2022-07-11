"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_loot = void 0;
const materials_manager_1 = require("../../manager_classes/materials_manager");
const SKIN_RAT_DIFFICULTY = 10;
const SKIN_HUMAN_DIFFICULTY = 40;
function generate_loot(killer, dead) {
    switch (dead) {
        case 'elo': {
            killer.stash.inc(materials_manager_1.ELODINO_FLESH, 1);
            return true;
        }
        case 'human': {
            killer.stash.inc(materials_manager_1.MEAT, 2);
            return true;
        }
        case 'test': {
            killer.stash.inc(materials_manager_1.MEAT, 2);
            return true;
        }
        case 'rat': {
            killer.stash.inc(materials_manager_1.MEAT, 1);
            killer.stash.inc(materials_manager_1.RAT_BONE, 2);
            let luck = Math.random();
            let skill = killer.skills.skinning.practice;
            if (luck * skill + 0.5 * skill > SKIN_RAT_DIFFICULTY) {
                killer.stash.inc(materials_manager_1.MEAT, 1);
                killer.stash.inc(materials_manager_1.RAT_BONE, 2);
                killer.stash.inc(materials_manager_1.RAT_SKIN, 1);
            }
            let learning_dice = Math.random();
            if (learning_dice > 0.05 * skill) {
                killer.skills.skinning.practice += 1;
            }
            return true;
        }
        case 'graci': {
            killer.stash.inc(materials_manager_1.GRACI_HAIR, 1);
            return true;
        }
    }
}
exports.generate_loot = generate_loot;
