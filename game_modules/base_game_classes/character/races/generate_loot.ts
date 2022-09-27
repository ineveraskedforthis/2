import { ELODINO_FLESH, GRACI_HAIR, MEAT, RAT_BONE, RAT_SKIN } from "../../../manager_classes/materials_manager";
import { Character} from "../character";
import { tagRACE } from "../character_parts";

const SKIN_RAT_DIFFICULTY = 10
const SKIN_HUMAN_DIFFICULTY = 40


export function generate_loot(killer:Character, dead:tagRACE): boolean {
    switch(dead) {
        case 'elo': {killer.stash.inc(ELODINO_FLESH, 1); return true}
        case 'human': {killer.stash.inc(MEAT, 2); return true}
        case 'test': {
                killer.stash.inc(MEAT, 2); 
                
                return true
            }
        case 'rat': {
                killer.stash.inc(MEAT, 1); 
                killer.stash.inc(RAT_BONE, 2);
                killer.stash.inc(RAT_SKIN, 2)
                let luck = Math.random()
                let skill = killer.skills.skinning

                if (luck * (skill) + skill > SKIN_RAT_DIFFICULTY) {
                    killer.stash.inc(MEAT, 2);
                    killer.stash.inc(RAT_SKIN, 4);
                }

                // let learning_dice = Math.random() * 20
                if (skill < SKIN_RAT_DIFFICULTY) {
                    killer.skills.skinning += 1
                }

                return true
            }
        case 'graci': {killer.stash.inc(GRACI_HAIR, 3); return true}
    }
    return false
}