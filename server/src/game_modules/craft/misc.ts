import { MATERIAL, SKILL } from "@content/content"
import { new_craft_bulk } from "./CraftBulk"

export const cotton_to_cloth = new_craft_bulk(
    'cotton_to_textile',
    [{material: MATERIAL.COTTON, amount: 10}],
    [{material: MATERIAL.TEXTILE, amount: 10, skill_checks: [{skill: SKILL.WEAVING, difficulty: 5}]}]
)

new_craft_bulk(
    'skin_to_leather',
    [{material: MATERIAL.SKIN_BALL, amount: 10}],
    [{material: MATERIAL.LEATHER_BALL, amount: 10, skill_checks:[{skill: SKILL.TANNING, difficulty: 10}]}],
)
new_craft_bulk(
    'skin_to_leather2',
    [{material: MATERIAL.SKIN_GRACI, amount: 10}],
    [{material: MATERIAL.LEATHER_GRACI, amount: 10, skill_checks: [{skill: SKILL.TANNING, difficulty: 10}]}],
)
new_craft_bulk(
    'skin_to_leather3',
    [{material: MATERIAL.SKIN_HUMAN, amount: 10}],
    [{material: MATERIAL.LEATHER_HUMAN, amount: 10, skill_checks:[{skill: SKILL.TANNING, difficulty: 10}]}],
)
new_craft_bulk(
    'skin_to_leather4',
    [{material: MATERIAL.SKIN_RAT, amount: 10}],
    [{material: MATERIAL.LEATHER_RAT, amount: 10, skill_checks:[{skill: SKILL.TANNING, difficulty: 10}]}],
)


new_craft_bulk(
    'smash_bone',
    [{material: MATERIAL.BONE_GRACI, amount: 2}],
    [{material: MATERIAL.SMALL_BONE_GRACI, amount: 1, skill_checks:[{skill: SKILL.BONE_CARVING, difficulty: 10}]}],
)

new_craft_bulk(
    'smash_bone_1',
    [{material: MATERIAL.BONE_HUMAN, amount: 2}],
    [{material: MATERIAL.SMALL_BONE_HUMAN, amount: 1, skill_checks:[{skill: SKILL.BONE_CARVING, difficulty: 10}]}],
)

new_craft_bulk(
    'smash_bone_2',
    [{material: MATERIAL.BONE_RAT, amount: 2}],
    [{material: MATERIAL.SMALL_BONE_RAT, amount: 1, skill_checks:[{skill: SKILL.BONE_CARVING, difficulty: 10}]}],
)