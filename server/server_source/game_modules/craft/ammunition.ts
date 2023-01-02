import { ARROW_BONE, RAT_BONE, WOOD } from "../manager_classes/materials_manager";
import { new_craft_bulk } from "./CraftBulk";

export namespace AmmunitionCraft {
    export const bone_arrow = 
        new_craft_bulk(
            'arrow', 
            [{material: WOOD, amount: 1}, {material: RAT_BONE, amount: 10}],
            [{material: ARROW_BONE, amount: 10}],
            [{skill: 'woodwork', difficulty: 20}, {skill: 'bone_carving', difficulty: 10}]
        )
} 