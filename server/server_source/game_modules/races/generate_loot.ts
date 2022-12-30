import { trim } from "../calculations/basic_functions";
import { Item } from "../items/item";
import { RAT_SKULL_HELMET_ARGUMENT } from "../items/items_set_up";
import { ItemSystem } from "../items/system";
import { ELODINO_FLESH, GRACI_HAIR, material_index, MEAT, RAT_BONE, RAT_SKIN } from "../manager_classes/materials_manager";
import { Character} from "../character/character";
import { tagRACE } from "../character/character_parts";

const SKIN_RAT_DIFFICULTY = 10
const SKIN_HUMAN_DIFFICULTY = 40

export namespace Loot {
    export function base(dead:tagRACE):{material: material_index, amount: number}[] {
        switch(dead) {
            case 'elo': return [{material: ELODINO_FLESH, amount: 3}]
            case 'human': return [{material: MEAT, amount: 6}]
            case 'rat': {
                    return  [  
                        {material: MEAT,     amount: 3},
                        {material: RAT_BONE, amount: 5},
                        {material: RAT_SKIN, amount: 4}
                    ]
                }
            case 'graci': return [{material: GRACI_HAIR, amount: 3}, {material: MEAT, amount: 50}]
        }
        return []
    }

    export function items(dead:tagRACE):Item[] {
        let responce = []
        console.log(dead)
        if (dead == 'rat') {
            let dice_drop = Math.random()
            console.log('drop dice ' + dice_drop)
            if (dice_drop > 0.5) {
                let item = ItemSystem.create(RAT_SKULL_HELMET_ARGUMENT)
                let dice_quality = trim(Math.random() * Math.random(), 0.1, 1)
                item.durability = Math.floor(dice_quality * 100)
                responce.push(item)
            }
        }

        return responce
    }

    export function skinning(dead: tagRACE): number {
        if (dead == 'rat') return 4
        return 0
    }
}