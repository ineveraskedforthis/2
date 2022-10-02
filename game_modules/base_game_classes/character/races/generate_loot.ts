import { ELODINO_FLESH, GRACI_HAIR, material_index, MEAT, RAT_BONE, RAT_SKIN } from "../../../manager_classes/materials_manager";
import { Character} from "../character";
import { tagRACE } from "../character_parts";

const SKIN_RAT_DIFFICULTY = 10
const SKIN_HUMAN_DIFFICULTY = 40

export namespace Loot {
    export function base(dead:tagRACE):{material: material_index, amount: number}[] {
        switch(dead) {
            case 'elo': return [{material: ELODINO_FLESH, amount: 1}]
            case 'human': return [{material: MEAT, amount: 1}]
            case 'rat': {
                    return  [  
                        {material: MEAT,     amount: 1},
                        {material: RAT_BONE, amount: 3},
                        {material: RAT_SKIN, amount: 1}
                    ]
                }
            case 'graci': return [{material: GRACI_HAIR, amount: 3}]
        }
        return []
    }

    export function skinning(dead: tagRACE): number {
        if (dead == 'rat') return 2
        return 0
    }
}