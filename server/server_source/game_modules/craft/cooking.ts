import { MATERIAL } from "@content/content";
import { new_craft_bulk } from "./CraftBulk";

export namespace Cooking {
    export const meat =
        new_craft_bulk(
            'meat_to_food',
            [{material: MATERIAL.MEAT_RAT, amount: 2}],
            [{material: MATERIAL.MEAT_RAT_FRIED, amount: 1}],
            [{skill: 'cooking', difficulty: 20}]
        )

    export const fish =
        new_craft_bulk(
            'fish_to_food',
            [{material: MATERIAL.FISH_OKU, amount: 2}],
            [{material: MATERIAL.FISH_OKU_FRIED, amount: 1}],
            [{skill: 'cooking', difficulty: 20}]
        )

    export const elodino =
        new_craft_bulk(
            'elo_to_zaz',
            [{material: MATERIAL.MEAT_ELODINO, amount: 1}],
            [{material: MATERIAL.ZAZ, amount: 1}],
            [{skill: 'cooking', difficulty: 10}, {skill: 'magic_mastery', difficulty: 30}]
        )
}