import { MATERIAL } from "@content/content"
import { new_craft_bulk } from "./CraftBulk"

export const cotton_to_cloth = new_craft_bulk(
    'cotton_to_textile',
    [{material: MATERIAL.COTTON, amount: 1}],
    [{material: MATERIAL.TEXTILE, amount: 1}],
    [{skill: 'clothier', difficulty: 5}]
)

new_craft_bulk(
    'skin_to_leather',
    [{material: MATERIAL.SKIN_BALL, amount: 2}],
    [{material: MATERIAL.LEATHER_BALL, amount: 1}],
    [{skill: "tanning", difficulty: 10}])
new_craft_bulk(
    'skin_to_leather2',
    [{material: MATERIAL.SKIN_GRACI, amount: 2}],
    [{material: MATERIAL.LEATHER_GRACI, amount: 1}],
    [{skill: "tanning", difficulty: 10}])
new_craft_bulk(
    'skin_to_leather3',
    [{material: MATERIAL.SKIN_HUMAN, amount: 2}],
    [{material: MATERIAL.LEATHER_HUMAN, amount: 1}],
    [{skill: "tanning", difficulty: 10}])
new_craft_bulk(
    'skin_to_leather4',
    [{material: MATERIAL.SKIN_RAT, amount: 2}],
    [{material: MATERIAL.LEATHER_RAT, amount: 1}],
    [{skill: "tanning", difficulty: 10}])


new_craft_bulk(
    'smash_bone',
    [{material: MATERIAL.BONE_GRACI, amount: 2}],
    [{material: MATERIAL.SMALL_BONE_GRACI, amount: 1}],
    [{skill: "bone_carving", difficulty: 10}])

new_craft_bulk(
    'smash_bone_1',
    [{material: MATERIAL.BONE_HUMAN, amount: 2}],
    [{material: MATERIAL.SMALL_BONE_HUMAN, amount: 1}],
    [{skill: "bone_carving", difficulty: 10}])

new_craft_bulk(
    'smash_bone_2',
    [{material: MATERIAL.BONE_RAT, amount: 2}],
    [{material: MATERIAL.SMALL_BONE_RAT, amount: 1}],
    [{skill: "bone_carving", difficulty: 10}])