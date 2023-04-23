import { COTTON, TEXTILE } from "../manager_classes/materials_manager"
import { new_craft_bulk } from "./CraftBulk"

export const cotton_to_cloth = new_craft_bulk(
    'cotton_to_textile',
    [{material: COTTON, amount: 1}],
    [{material: TEXTILE, amount: 1}],
    [{skill: 'clothier', difficulty: 5}]
)