import { MATERIAL, SKILL } from "@content/content";
import { new_craft_bulk } from "./CraftBulk";

export namespace Cooking {
    export const meat =
        new_craft_bulk(
            'meat_to_food1',
            [{material: MATERIAL.MEAT_RAT, amount: 10}],
            [{material: MATERIAL.MEAT_RAT_FRIED, amount: 10, skill_checks: [
                {skill: SKILL.COOKING, difficulty: 20}
            ]}]
        )

    export const meat2 =
        new_craft_bulk(
            'meat_to_food2',
            [{material: MATERIAL.MEAT_HUMAN, amount: 10}],
            [{material: MATERIAL.MEAT_HUMAN_FRIED, amount: 10, skill_checks: [
                {skill: SKILL.COOKING, difficulty: 20}
            ]}],

        )

    export const meat3 =
        new_craft_bulk(
            'meat_to_food3',
            [{material: MATERIAL.MEAT_GRACI, amount: 10}],
            [{material: MATERIAL.MEAT_GRACI_FRIED, amount: 10, skill_checks: [
                {skill: SKILL.COOKING, difficulty: 20}
            ]}],
        )

    export const fish =
        new_craft_bulk(
            'fish_to_food',
            [{material: MATERIAL.FISH_OKU, amount: 10}],
            [{material: MATERIAL.FISH_OKU_FRIED, amount: 10, skill_checks: [
                {skill: SKILL.COOKING, difficulty: 20}
            ]}],
        )

    export const elodino =
        new_craft_bulk(
            'elo_to_zaz',
            [{material: MATERIAL.MEAT_ELODINO, amount: 10}],
            [{material: MATERIAL.ZAZ, amount: 10, skill_checks: [
                {skill: SKILL.COOKING, difficulty: 5},
                {skill: SKILL.MAGIC, difficulty: 5},
                {skill: SKILL.ALCHEMY, difficulty: 30}
            ]}]
        )

    export const berries =
        new_craft_bulk(
            'berry_to_zaz',
            [{material: MATERIAL.BERRY_ZAZ, amount: 20}],
            [{material: MATERIAL.ZAZ, amount: 5, skill_checks: [
                {skill: SKILL.COOKING, difficulty: 10},
                {skill: SKILL.MAGIC, difficulty: 10},
                {skill: SKILL.ALCHEMY, difficulty: 50}
            ]}]
        )
}