"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_loot = void 0;
const materials_manager_1 = require("../../../manager_classes/materials_manager");
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
            killer.stash.inc(materials_manager_1.RAT_SKIN, 2);
            let luck = Math.random();
            let skill = killer.skills.skinning;
            if (luck * (skill) + skill > SKIN_RAT_DIFFICULTY) {
                killer.stash.inc(materials_manager_1.MEAT, 2);
                killer.stash.inc(materials_manager_1.RAT_SKIN, 4);
            }
            // let learning_dice = Math.random() * 20
            if (skill < SKIN_RAT_DIFFICULTY) {
                killer.skills.skinning += 1;
            }
            return true;
        }
        case 'graci': {
            killer.stash.inc(materials_manager_1.GRACI_HAIR, 3);
            return true;
        }
    }
    return false;
}
exports.generate_loot = generate_loot;
