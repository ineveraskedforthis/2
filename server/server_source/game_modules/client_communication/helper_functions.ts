import { cell_id } from "@custom_types/common";
import { JSONficate } from "../json";
import { OrderBulkJson } from "../market/classes";
import { Convert } from "../systems_communication";

export function prepare_market_orders(cell_id: cell_id) {
    let data = Convert.cell_id_to_bulk_orders(cell_id);
    let orders_array = Array.from(data)
    let responce: OrderBulkJson[] = []
    for (let order_id of orders_array) {
        const order = Convert.id_to_bulk_order(order_id)
        if (order.amount > 0) {
            responce.push(JSONficate.market_order_bulk(order))
        }
    }
    return responce
}