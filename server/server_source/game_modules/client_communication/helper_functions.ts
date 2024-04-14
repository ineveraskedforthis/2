import { cell_id } from "@custom_types/ids";
import { JSONficate } from "../json";
import { MarketOrderJson } from "../market/classes";
import { Convert } from "../systems_communication";
import { DataID } from "../data/data_id";
import { Data } from "../data/data_objects";

export function prepare_market_orders(cell_id: cell_id) {
    let data = DataID.Cells.market_order_id_list(cell_id);
    let orders_array = Array.from(data)
    let response: MarketOrderJson[] = []
    for (let order_id of orders_array) {
        const order = Data.MarketOrders.from_id(order_id)
        if (order.amount > 0) {
            response.push(JSONficate.market_order_bulk(order))
        }
    }
    return response
}