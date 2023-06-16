import { cell_id, money } from "@custom_types/common";
import { Character } from "../character/character";
import { ELODINO_FLESH, materials, material_index, RAT_BONE, RAT_SKIN, WOOD, MEAT, FOOD, FISH, ZAZ, ARROW_BONE } from "../manager_classes/materials_manager"
import { box, CraftBulk, CraftItem } from "../craft/crafts_storage"
import { MapSystem } from "../map/system";
import { output_bulk } from "../craft/CraftBulk";

export function base_price(cell_id: cell_id, material: material_index): money {
    switch(material) {
        case WOOD: {
            // let cell = MapSystem.id_to_cell(cell_id)
            if (MapSystem.has_wood(cell_id)) return 3 as money
            return 10 as money
        }
        case RAT_BONE:
            return 3 as money

        case RAT_SKIN:
            return 10 as money

        case WOOD: 
            return 10 as money

        case ELODINO_FLESH:
            return 50 as money
        
        case MEAT:
            return 8 as money

        case FISH:
            return 8 as money
        
        case FOOD: 
            return 8 as money

        case ZAZ:
            return 30 as money

        case ARROW_BONE:
            return 10 as money
    }

    return 4 as money
}

export interface price {
    material: material_index,
    price: money
}

export interface priced_box {
    material: material_index,
    price: money
    amount: number
}

type PriceEstimator = (character: Character, material: material_index) => money

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

    export function craft_bulk_profitability(character: Character, craft: CraftBulk) {
        const input_price = price_norm_box(character, craft.input, buy_price_bulk)
        const output_price = price_norm_box(character, output_bulk(character, craft), sell_price_bulk)

        // console.log(character.name, craft.id)
        // console.log(craft.input)
        // for (let box of craft.input) {
        //     console.log(`
        //         i think i can buy 
        //         ${box.amount} of ${materials.index_to_material(box.material).string_tag} 
        //         for ${buy_price_bulk(character, box.material) * box.amount}`)
        // }

        // console.log(output_bulk(character, craft))
        // for (let box of output_bulk(character, craft)) {
        //     console.log(`
        //         i think i can sell 
        //         ${box.amount} of ${materials.index_to_material(box.material).string_tag} 
        //         for ${sell_price_bulk(character, box.material) * box.amount}`)
        // }

        // console.log('price of inputs', input_price)
        // console.log(craft.input)
        // console.log('price of outputs', output_price)
        // console.log(craft.input)

        const profit = output_price - input_price;

        return profit
    }
}