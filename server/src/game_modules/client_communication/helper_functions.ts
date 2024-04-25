import { cell_id } from "@custom_types/ids";
import { JSONficate } from "../json";
import { MarketOrderJson } from "../market/classes";
import { DataID } from "../data/data_id";
import { Data } from "../data/data_objects";

export function prepare_market_orders(cell_id: cell_id) {
    let response: MarketOrderJson[] = []
    DataID.Cells.for_each_market_order(cell_id, (item) => {
        let order = Data.MarketOrders.from_id(item);
        if (order.amount > 0) {
            response.push(JSONficate.market_order_bulk(order))
        }
    })
    return response
}