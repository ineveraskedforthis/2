import { Character } from "../character/character";
import { material_index } from "../manager_classes/materials_manager";
import { money } from "../types";
import { base_price } from "./helpers";

export namespace AItrade {
    export function buy_price_bulk( character: Character, material: material_index) {
        let base = base_price(character.cell_id, material)

        if (character.archetype.ai_map == 'urban_trader') {
            return Math.floor(base * 0.8) as money
        }
        return base as money
    }

    export function sell_price_bulk(character: Character, material: material_index) {
        let base = base_price(character.cell_id, material)

        if (character.archetype.ai_map == 'urban_trader') {
            return Math.floor(base * 1.5) as money
        }

        return base as money
    }
}