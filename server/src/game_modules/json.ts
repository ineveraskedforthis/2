import { Data } from "./data/data_objects";
import { MarketOrder, MarketOrderJson } from "./market/classes";

export namespace JSONficate {
    export function market_order_bulk(order: MarketOrder):MarketOrderJson {
        let owner = Data.Characters.from_id(order.owner_id)

        return {
            typ: order.typ,
            tag: order.material,
            owner_id: order.owner_id,
            owner_name: owner.get_name(),
            amount: order.amount,
            price: order.price,
            id: order.id,
            // cell_id: order.cell_id
        };
    }
}