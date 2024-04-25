import { MATERIAL, SKILL } from "@content/content";
import { new_craft_bulk } from "./CraftBulk";

export namespace AmmunitionCraft {
    export const bone_arrow =
        new_craft_bulk(
            'arrow1',
            [{material: MATERIAL.WOOD_RED, amount: 1}, {material: MATERIAL.SMALL_BONE_RAT, amount: 10}],
            [{material: MATERIAL.ARROW_BONE, amount: 10, skill_checks: [
                {skill: SKILL.WOODWORKING, difficulty: 20},
                {skill: SKILL.BONE_CARVING, difficulty: 10},
                {skill: SKILL.FLETCHING, difficulty: 50}
            ]}]
        )

    export const bone_arrow_graci =
        new_craft_bulk(
            'arrow2',
            [{material: MATERIAL.WOOD_RED, amount: 1}, {material: MATERIAL.SMALL_BONE_GRACI, amount: 2}],
            [{material: MATERIAL.ARROW_BONE, amount: 10, skill_checks: [
                {skill: SKILL.WOODWORKING, difficulty: 20},
                {skill: SKILL.BONE_CARVING, difficulty: 10},
                {skill: SKILL.FLETCHING, difficulty: 50}
            ]}]
        )

    export const bone_arrow_human =
        new_craft_bulk(
            'arrow3',
            [{material: MATERIAL.WOOD_RED, amount: 1}, {material: MATERIAL.SMALL_BONE_HUMAN, amount: 5}],
            [{material: MATERIAL.ARROW_BONE, amount: 10, skill_checks: [
                {skill: SKILL.WOODWORKING, difficulty: 20},
                {skill: SKILL.BONE_CARVING, difficulty: 10},
                {skill: SKILL.FLETCHING, difficulty: 50}
            ]}]
        )

    export const zaz_arrow =
        new_craft_bulk(
            'arrow_zaz',
            [{material: MATERIAL.ARROW_BONE, amount: 10}, {material: MATERIAL.ZAZ, amount: 1}],
            [{material: MATERIAL.ARROW_ZAZ, amount: 10, skill_checks: [
                {skill: SKILL.MAGIC, difficulty: 5},
                {skill: SKILL.ENCHANTING, difficulty: 10}
            ]}],
        )
}