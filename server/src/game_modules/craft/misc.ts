import { MATERIAL } from "@content/content"
import { new_craft_bulk } from "./CraftBulk"

export const cotton_to_cloth = new_craft_bulk(
    'cotton_to_textile',
    [{material: MATERIAL.COTTON, amount: 1}],
    [{material: MATERIAL.TEXTILE, amount: 1}],
    [{skill: 'clothier', difficulty: 5}]
)