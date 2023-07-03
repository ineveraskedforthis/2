// import { 
//     RAT_SKIN_HELMET_ARGUMENT,
//     RAT_SKIN_GLOVES_ARGUMENT, 
//     RAT_SKIN_ARMOUR_ARGUMENT,
//     RAT_SKIN_PANTS_ARGUMENT,
//     RAT_SKIN_BOOTS_ARGUMENT,
//     ELODINO_DRESS_ARGUMENT,
//     GRACI_HAIR_ARGUMENT, 
//     BONE_ARMOUR_ARGUMENT,
//     BASIC_BOW_ARGUMENT,
//     BONE_DAGGER_ARGUMENT,
//     BONE_SPEAR_ARGUMENT,
//     SPEAR_ARGUMENT,
//     SWORD_ARGUMENT,
//     WOODEN_MACE_ARGUMENT,
//     CLOTH_ARMOUR_ARGUMENT,
//     CLOTH_GLOVES_ARGUMENT,
//     CLOTH_HELMET_ARGUMENT} from "../items/items_set_up"
import { RAT_SKIN, ELODINO_FLESH, RAT_BONE, GRACI_HAIR, STEEL, WOOD, TEXTILE } from "../manager_classes/materials_manager"
import { new_craft_item } from "./CraftItem"

export namespace CraftItem {
    export namespace RatSkin {
        export const helmet =
            new_craft_item(
                'rat_skin_helmet',
                [{material: RAT_SKIN, amount: 5}], 
                'rat_skin_helmet',
                [],
                [{skill: 'clothier', difficulty: 20}]
            )
        export const glove_right =
            new_craft_item(
                'rat_skin_glove_right',
                [{material: RAT_SKIN, amount: 3}], 
                'rat_skin_glove_right',
                [],
                [{skill: 'clothier', difficulty: 20}]
            )
        export const glove_left =
            new_craft_item(
                'rat_skin_glove_left',
                [{material: RAT_SKIN, amount: 3}], 
                'rat_skin_glove_left',
                [],
                [{skill: 'clothier', difficulty: 20}]
            )
        export const armour =
            new_craft_item(
                'rat_skin_armour',
                [{material: RAT_SKIN, amount: 10}], 
                'rat_skin_armour',
                [],
                [{skill: 'clothier', difficulty: 20}]
            )
        export const pants =
            new_craft_item(
                'rat_skin_pants',
                [{material: RAT_SKIN, amount: 8}], 
                'rat_skin_pants',
                [],
                [{skill: 'clothier', difficulty: 20}]
            )
        export const boots =
            new_craft_item(
                'rat_skin_boots',
                [{material: RAT_SKIN, amount: 8}], 
                'rat_skin_boots',
                [],
                [{skill: 'clothier', difficulty: 20}]
            )
    }

    export namespace Cloth {
        export const armour = 
            new_craft_item(
                'cloth_armour',
                [{material: TEXTILE, amount: 10}],
                'cloth_mail',
                [],
                [{skill: 'clothier', difficulty: 50}]
            )
        export const socks = 
            new_craft_item(
                'cloth_socks',
                [{material: TEXTILE, amount: 5}],
                'cloth_socks',
                [],
                [{skill: 'clothier', difficulty: 50}]
            )
        export const glove_left = 
            new_craft_item(
                'cloth_glove_left',
                [{material: TEXTILE, amount: 3}],
                'cloth_glove_left',
                [],
                [{skill: 'clothier', difficulty: 50}]
            )
        export const glove_right = 
            new_craft_item(
                'cloth_glove_right',
                [{material: TEXTILE, amount: 3}],
                'cloth_glove_right',
                [],
                [{skill: 'clothier', difficulty: 50}]
            )
        export const helmet = 
            new_craft_item(
                'cloth_helmet',
                [{material: TEXTILE, amount: 5}],
                'cloth_helmet',
                [],
                [{skill: 'clothier', difficulty: 50}]
            )
    }    

    export const elodino_dress = 
        new_craft_item(
            'elodino_dress',
            [{material: ELODINO_FLESH, amount: 4}], 
            'elodino_dress',
            [],
            [{skill: 'clothier', difficulty: 50}]
        )

    export const graci_hair =
        new_craft_item(
            'graci_hair',
            [{material: GRACI_HAIR, amount: 1}], 
            'graci_hair',
            [],
            [{skill: 'clothier', difficulty: 5}]
        )

    export namespace Bone {
        export const armour =
            new_craft_item(
                'bone_armour',
                [{material: RAT_BONE, amount: 50}], 
                'bone_armour',
                [],
                [{skill: 'bone_carving', difficulty: 50}]
            )
        export const dagger = 
        new_craft_item(
            'bone_dagger',
            [{material: RAT_BONE, amount: 15}], 
            'bone_dagger',
            [],
            [{skill: 'bone_carving', difficulty: 30}]
        )
        export const spear = 
        new_craft_item(
            'spear_wood_bone',
            [{material: WOOD, amount: 2}, {material: RAT_BONE, amount: 4}], 
            'bone_spear',
            [],
            [{skill: 'woodwork', difficulty: 10}, {skill: 'bone_carving', difficulty: 5}]
        )
    }

    export namespace Wood {
        export const mace = 
            new_craft_item(
                'wooden_mace',
                [{material: WOOD, amount: 8}], 
                'wooden_mace',
                [],
                [{skill: 'woodwork', difficulty: 10}]
            )
        export const spear =
            new_craft_item(
                'spear_wood',
                [{material: WOOD, amount: 2}], 
                'spear',
                [],
                [{skill: 'woodwork', difficulty: 10}]
            )
        export const bow =
            new_craft_item(
                'bow_wood',
                [{material: WOOD, amount: 2}], 
                'bow',
                [],
                [{skill: 'woodwork', difficulty: 20}]
            )
    }

    export const sword =
        new_craft_item(
            'steel_sword',
            [{material: STEEL, amount: 2}], 
            'sword',
            [],
            [{skill: 'smith', difficulty: 60}]
        )
}