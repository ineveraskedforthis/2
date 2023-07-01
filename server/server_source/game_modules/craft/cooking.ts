import { MEAT, FOOD, FISH, ZAZ, ELODINO_FLESH } from "../manager_classes/materials_manager";
import { new_craft_bulk } from "./CraftBulk";

export namespace Cooking {
    export const meat =
        new_craft_bulk(
            'meat_to_food',
            [{material: MEAT, amount: 2}],
            [{material: FOOD, amount: 1}],
            [{skill: 'cooking', difficulty: 20}]
        )

    export const fish =
        new_craft_bulk(
            'fish_to_food',
            [{material: FISH, amount: 2}],
            [{material: FOOD, amount: 1}],
            [{skill: 'cooking', difficulty: 20}]
        )

    export const elodino =
        new_craft_bulk(
            'elo_to_zaz',
            [{material: ELODINO_FLESH, amount: 1}],
            [{material: ZAZ, amount: 1}, {material: MEAT, amount: 0.25}],
            [{skill: 'cooking', difficulty: 10}, {skill: 'magic_mastery', difficulty: 30}]
        )
}