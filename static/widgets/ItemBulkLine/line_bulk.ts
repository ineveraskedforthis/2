import { socket } from "../../modules/globals.js";
import { List, sort_callback_number_reverse_order, sort_callback_string_reverse_order } from "../List/list.js";
import { div } from "../Div/custom_div.js";

function send_execute_order_request(order_id: number, amount: number) {
    socket.emit('execute-order', { amount: amount, order: order_id });
}

export function buy_sell_callback(order_id: number, amount: number) {
    return (() => send_execute_order_request(order_id, amount));
}

export function clear_callback(order_id: number) {
    return () => socket.emit('clear-order', order_id)
}

export function new_ItemBulkLine(
    good_tag: string, 
    buy_price: number|string, 
    sell_price: number|string, 
    amount: number, 
    order_id: number) 
{
    const background_string = 'no-repeat left/contain url(/static/img/stash_' + good_tag + '.png)'
    
    return div(undefined, '',['goods_type', good_tag], undefined, undefined,[
        div(undefined, '', ['goods_icon', 'small_square'], background_string, undefined, []),
        div(undefined, good_tag, ['goods_name'], undefined, undefined, []),
        div(undefined, buy_price.toString(), ['goods_avg_buy_price'], undefined, undefined, []),
        div(undefined, sell_price.toString(), ['goods_avg_sell_price'], undefined, undefined, []),
        div(undefined, amount.toString(), ['goods_amount_in_inventory'], undefined, undefined, []),

        div(undefined, 'Buy/Sell 1', ['market_button'], undefined, buy_sell_callback(order_id, 1), []),
        div(undefined, 'Buy/Sell 10', ['market_button'], undefined, buy_sell_callback(order_id, 10), []),
        div(undefined, 'Buy/Sell 50', ['market_button'], undefined, buy_sell_callback(order_id, 50), []),
        div(undefined, 'Remove', ['market_button'], undefined, clear_callback(order_id), [])
    ])
}

export function edit_ItemBulkLine(
    line: Element,
    good_tag: string, 
    buy_price: number|string, 
    sell_price: number|string, 
    amount: number, 
    order_id: number) {
    
    line.replaceWith(new_ItemBulkLine(good_tag, buy_price, sell_price, amount, order_id));
}


export function new_ItemBulkLineHeader(market_list: List) {
    return div(undefined, '', ['goods_type', 'header'], undefined, undefined, [
        div(undefined, 'Icon', ['goods_icon', 'small_square'], undefined, undefined, []),
        div(undefined, 'Good', ['goods_name', 'active'], undefined, sort_callback_string_reverse_order(market_list, 'goods_name'), []),
        div(undefined, 'Buy Price', ['goods_avg_buy_price', 'active'], undefined, sort_callback_number_reverse_order(market_list, 'goods_avg_buy_price'), []),
        div(undefined, 'Sell Price', ['goods_avg_sell_price', 'active'], undefined, sort_callback_number_reverse_order(market_list, 'goods_avg_sell_price'), []),
        div(undefined, 'Amount', ['goods_amount_in_inventory', 'active'], undefined, sort_callback_number_reverse_order(market_list, 'goods_amount_in_inventory'), []),
        div(undefined, 'Action', [], undefined, undefined, [])
    ])
}


// export function sort_market(market_div: HTMLElement, field: string|'keep', current_sort_var: { field: string, direction: 'asc' | 'desc' },  flag: 'invert' | 'keep') {
//     const unsorted = [...market_div.children];
//     if (flag == 'invert') {
//         current_sort_var.direction = current_sort_var.direction == 'asc' ? 'desc' : 'asc';
//     }
//     if (field != 'keep') {
//         current_sort_var.field = field;
//     }
//     const order_modifier = current_sort_var.direction == 'asc' ? 1 : -1;    
//     const sorted = unsorted.sort((a, b) => {
//         if (a.classList.contains('hidden')) return 1
//         if (b.classList.contains('hidden')) return -1
//         if (current_sort_var.field == 'goods_name') {
//             const name_a = a.querySelector(`.${current_sort_var.field}`)!;
//             const name_b = b.querySelector(`.${current_sort_var.field}`)!;
//             return name_a.innerHTML.localeCompare(name_b.innerHTML) * order_modifier;
//         } else {
//             let value_a = a.querySelector(`.${current_sort_var.field}`)!.innerHTML;
//             let value_b = b.querySelector(`.${current_sort_var.field}`)!.innerHTML;
//             if (value_a == '') value_a = '0';
//             if (value_b == '') value_b = '0';
//             return (parseInt(value_a) - parseInt(value_b)) * order_modifier;
//         }
//     })
//     market_div.replaceChildren(...sorted);
// }
