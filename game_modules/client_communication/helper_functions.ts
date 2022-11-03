import { Cell } from "../map/cell";
import { OrderBulkJson } from "../market/classes";
import { BulkOrders } from "../market/system";
import { cell_id } from "../types";

export function prepare_market_orders(cell_id: cell_id) {
    let data = BulkOrders.from_cell_id(cell_id);
    let orders_array = Array.from(data)
    let responce: OrderBulkJson[] = []
    for (let order_id of orders_array) {
        const order = BulkOrders.id_to_order(order_id)
        if (order.amount > 0) {
            responce.push(BulkOrders.json(order))
        }
    }
    return responce
}