import { 
    RAT_SKIN_HELMET_ARGUMENT,
    RAT_SKIN_GLOVES_ARGUMENT, 
    RAT_SKIN_ARMOUR_ARGUMENT,
    RAT_SKIN_PANTS_ARGUMENT,
    RAT_SKIN_BOOTS_ARGUMENT,
    ELODINO_DRESS_ARGUMENT,
    GRACI_HAIR_ARGUMENT, 
    BONE_ARMOUR_ARGUMENT,
    BASIC_BOW_ARGUMENT,
    BONE_DAGGER_ARGUMENT,
    BONE_SPEAR_ARGUMENT,
    SPEAR_ARGUMENT,
    SWORD_ARGUMENT,
    WOODEN_MACE_ARGUMENT} from "../items/items_set_up"
import { RAT_SKIN, ELODINO_FLESH, RAT_BONE, GRACI_HAIR, STEEL, WOOD } from "../manager_classes/materials_manager"
import { new_craft_item } from "./CraftItem"

export namespace CraftItem {
    export namespace RatSkin {
        export const helmet =
            new_craft_item(
                'rat_skin_helmet',
                [{material: RAT_SKIN, amount: 5}], 
                RAT_SKIN_HELMET_ARGUMENT,
                [{skill: 'clothier', difficulty: 20}]
            )
        export const gloves =
            new_craft_item(
                'rat_skin_gloves',
                [{material: RAT_SKIN, amount: 3}], 
                RAT_SKIN_GLOVES_ARGUMENT,
                [{skill: 'clothier', difficulty: 20}]
            )
        export const armour =
            new_craft_item(
                'rat_skin_armour',
                [{material: RAT_SKIN, amount: 10}], 
                RAT_SKIN_ARMOUR_ARGUMENT,
                [{skill: 'clothier', difficulty: 20}]
            )
        export const pants =
            new_craft_item(
                'rat_skin_pants',
                [{material: RAT_SKIN, amount: 8}], 
                RAT_SKIN_PANTS_ARGUMENT,
                [{skill: 'clothier', difficulty: 20}]
            )
        export const boots =
            new_craft_item(
                'rat_skin_boots',
                [{material: RAT_SKIN, amount: 8}], 
                RAT_SKIN_BOOTS_ARGUMENT,
                [{skill: 'clothier', difficulty: 20}]
            )
    }

    export const elodino_dress = 
        new_craft_item(
            'elodino_dress',
            [{material: ELODINO_FLESH, amount: 4}], 
            ELODINO_DRESS_ARGUMENT,
            [{skill: 'clothier', difficulty: 50}]
        )

    export const graci_hair =
        new_craft_item(
            'graci_hair',
            [{material: GRACI_HAIR, amount: 1}], 
            GRACI_HAIR_ARGUMENT,
            [{skill: 'clothier', difficulty: 5}]
        )

    export namespace Bone {
        export const armour =
            new_craft_item(
                'bone_armour',
                [{material: RAT_BONE, amount: 50}], 
                BONE_ARMOUR_ARGUMENT,
                [{skill: 'bone_carving', difficulty: 50}]
            )
        export const dagger = 
        new_craft_item(
            'bone_dagger',
            [{material: RAT_BONE, amount: 15}], 
            BONE_DAGGER_ARGUMENT,
            [{skill: 'bone_carving', difficulty: 30}]
        )
        export const spear = 
        new_craft_item(
            'spear_wood_bone',
            [{material: WOOD, amount: 2}, {material: RAT_BONE, amount: 4}], 
            BONE_SPEAR_ARGUMENT,
            [{skill: 'woodwork', difficulty: 10}, {skill: 'bone_carving', difficulty: 5}]
        )
    }

    export namespace Wood {
        export const mace = 
            new_craft_item(
                'wooden_mace',
                [{material: WOOD, amount: 8}], 
                WOODEN_MACE_ARGUMENT,
                [{skill: 'woodwork', difficulty: 10}]
            )
        export const spear =
            new_craft_item(
                'spear_wood',
                [{material: WOOD, amount: 2}], 
                SPEAR_ARGUMENT,
                [{skill: 'woodwork', difficulty: 10}]
            )
        export const bow =
            new_craft_item(
                'bow_wood',
                [{material: WOOD, amount: 2}], 
                BASIC_BOW_ARGUMENT,
                [{skill: 'woodwork', difficulty: 20}]
            )
    }

    export const sword =
    new_craft_item(
        'steel_sword',
        [{material: STEEL, amount: 2}], 
        SWORD_ARGUMENT,
        [{skill: 'smith', difficulty: 60}]
    )
}