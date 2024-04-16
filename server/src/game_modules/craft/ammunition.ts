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

    export const bone_arrow_graci =
        new_craft_bulk(
            'arrow',
            [{material: MATERIAL.WOOD_RED, amount: 1}, {material: MATERIAL.SMALL_BONE_GRACI, amount: 2}],
            [{material: MATERIAL.ARROW_BONE, amount: 10}],
            [{skill: 'woodwork', difficulty: 20}, {skill: 'bone_carving', difficulty: 10}]
        )

    export const bone_arrow_human =
        new_craft_bulk(
            'arrow',
            [{material: MATERIAL.WOOD_RED, amount: 1}, {material: MATERIAL.SMALL_BONE_HUMAN, amount: 5}],
            [{material: MATERIAL.ARROW_BONE, amount: 10}],
            [{skill: 'woodwork', difficulty: 20}, {skill: 'bone_carving', difficulty: 10}]
        )

    export const zaz_arrow =
        new_craft_bulk(
            'arrow_zaz',
            [{material: MATERIAL.ARROW_BONE, amount: 10}, {material: MATERIAL.ZAZ, amount: 1}],
            [{material: MATERIAL.ARROW_ZAZ, amount: 5}],
            [{skill: 'magic_mastery', difficulty: 5}]
        )
}