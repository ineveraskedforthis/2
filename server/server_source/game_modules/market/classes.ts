import { money } from "@custom_types/common.js";
import { material_index } from "@custom_types/inventory.js";
import { character_id, market_order_id } from "@custom_types/common.js";
import { DataID } from "../data/data_id.js";


export interface MarketOrderJson {
    typ: 'sell'|'buy',
    tag: material_index,
    owner_id: character_id,
    owner_name: string,
    amount: number
    price: money
    id: market_order_id
}

export interface MarketOrderData {
    id: market_order_id
    typ: 'sell'|'buy'
    material: material_index
    amount: number
    price: money
}

export interface MarketOrderInterface extends MarketOrderData {
    readonly owner_id: character_id
}

export class MarketOrder implements MarketOrderInterface {
    id: market_order_id;
    typ: 'sell'|'buy'
    material: material_index
    amount: number
    price: money

    constructor(id: market_order_id|undefined, amount: number, price: money, typ: 'sell'|'buy', tag: material_index, owner_id: character_id) {
        if (id == undefined) {
            this.id = DataID.MarketOrders.new_id(owner_id)
        } else {
            this.id = id
            DataID.MarketOrders.register(id, owner_id)
        }

        this.typ = typ
        this.material = tag
        this.amount = amount
        this.price = price
    }

    get owner_id(): character_id {
        return DataID.MarketOrders.owner(this.id)
    }

    toJSON(): MarketOrderInterface {
        return {
            id: this.id,
            owner_id: this.owner_id,
            amount: this.amount,
            material: this.material,
            price: this.price,
            typ: this.typ
        }
    }
}