import { OrderBulk, OrderBulkJson } from "./market/classes";
import { Convert } from "./systems_communication";

export namespace JSONficate {
    export function market_order_bulk(order: OrderBulk):OrderBulkJson {
        let owner = Convert.id_to_character(order.owner_id)

        return {
            typ: order.typ,
            tag: order.tag,
            owner_id: order.owner_id,
            owner_name: owner.name,
            amount: order.amount,
            price: order.price,
            id: order.id,
            // cell_id: order.cell_id
        };
    }
}