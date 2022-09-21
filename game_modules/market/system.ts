import { Character } from "../base_game_classes/character/character";
import { material_index } from "../manager_classes/materials_manager";
import { money, order_bulk_id } from "../types";
import { OrderBulk } from "./market_order";

var orders_bulk:OrderBulk[] = []
var last_id = 0

export namespace BulkOrders {
    function save() {

    }

    function load() {

    }

    function create(amount: number, price: money, typ:'sell'|'buy', tag: material_index, owner: Character) {
        console.log('new market order')
        
        let order = new OrderBulk(last_id as order_bulk_id, amount, price, typ, tag, owner.id, owner.cell_id)
        orders_bulk.push(order)
        
        return order
    }
}

export namespace SingularOrders {}