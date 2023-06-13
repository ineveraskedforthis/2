import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { material_index } from "../manager_classes/materials_manager";
// import { money } from "../types";
import { base_price } from "./helpers";

export namespace AItrade {
    export function buy_price_bulk( character: Character, material: material_index) {
        let base = base_price(character.cell_id, material);
        let belief = character.ai_price_belief_buy.get(material);
        if (belief != undefined) base = belief;
        // if (character.archetype.ai_map == 'urban_trader') {
        //     return Math.floor(base * 0.8) as money;
        // }
        return base as money;
    }

    export function sell_price_bulk(character: Character, material: material_index) {
        let belief = character.ai_price_belief_sell.get(material)
        if (belief == undefined) return 1;
        // if (character.archetype.ai_map == 'urban_trader') {
        //     return Math.floor(belief * 1.2) as money
        // }
        return belief as money
    }
}