import { money } from "@custom_types/common";
import { cell_id } from "@custom_types/ids";
import { Character } from "../character/character";
import { box, CraftBulkTemplate } from "@custom_types/inventory";
import { output_bulk } from "../craft/CraftBulk";
import { MATERIAL } from "@content/content";

export function base_price(cell_id: cell_id, material: MATERIAL): money {
    return 15 as money
}

export interface price {
    material: MATERIAL,
    price: money
}

export interface priced_box {
    material: MATERIAL,
    price: money
    amount: number
}

type PriceEstimator = (character: Character, material: MATERIAL) => money

export namespace AItrade {
    export function buy_price_bulk( character: Character, material: MATERIAL) {
        let base = base_price(character.cell_id, material);
        let belief = character.ai_price_belief_buy.get(material);
        if (belief != undefined) base = belief;
        // if (character.archetype.ai_map == 'urban_trader') {
        //     return Math.floor(base * 0.8) as money;
        // }
        return base as money;
    }

    export function sell_price_bulk(character: Character, material: MATERIAL) {
        let belief = character.ai_price_belief_sell.get(material)
        if (belief == undefined) return base_price(character.cell_id, material) as money;
        // if (character.archetype.ai_map == 'urban_trader') {
        //     return Math.floor(belief * 1.2) as money
        // }
        return belief as money
    }

    export function price_norm(character: Character, items_vector: priced_box[]): number {
        let norm = 0
        for (let item of items_vector) {
            norm += item.amount * item.price
        }
        return norm
    }

    export function price_norm_box(
        character: Character,
        items_vector: box[],
        price_estimator: PriceEstimator): number
    {
        let norm = 0
        for (let item of items_vector) {
            norm += item.amount * price_estimator(character, item.material)
        }
        return norm
    }

    export function craft_bulk_profitability(character: Character, craft: CraftBulkTemplate) {
        const input_price = price_norm_box(character, craft.input, buy_price_bulk)
        const output_price = price_norm_box(character, output_bulk(character, craft), sell_price_bulk)
        const profit = output_price - input_price;
        return profit
    }

}