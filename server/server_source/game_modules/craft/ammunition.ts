import { MATERIAL } from "@content/content";
import { new_craft_bulk } from "./CraftBulk";

export namespace AmmunitionCraft {
    export const bone_arrow =
        new_craft_bulk(
            'arrow',
            [{material: MATERIAL.WOOD_RED, amount: 1}, {material: MATERIAL.SMALL_BONE_RAT, amount: 10}],
            [{material: MATERIAL.ARROW_BONE, amount: 10}],
            [{skill: 'woodwork', difficulty: 20}, {skill: 'bone_carving', difficulty: 10}]
        )
}