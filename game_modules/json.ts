import { CharacterSystem } from "./base_game_classes/character/system";
import { MarketOrderBulk, MarketOrderBulkJson } from "./market/market_order";

namespace JSONficate {
    export function market_order_bulk(order: MarketOrderBulk):MarketOrderBulkJson {
        let owner = CharacterSystem.id_to_character(order.owner_id)

        return {
            typ: order.typ,
            tag: order.tag,
            owner_id: order.owner_id,
            owner_name: owner.name,
            amount: order.amount,
            price: order.price,
            id: order.id,
            cell_id: order.cell_id
        };
    }
}