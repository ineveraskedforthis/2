import { socket } from "../../modules/globals.js";
function div(id, innerHTML, classes, background, onckick, children) {
    let div = document.createElement('div');
    if (id != undefined) {
        div.id = id;
    }
    div.innerHTML = innerHTML;
    div.classList.add(...classes);
    if (background != undefined) {
        div.style.background = background;
    }
    if (onckick != undefined) {
        div.onclick = onckick;
    }
    for (let child of children) {
        div.appendChild(child);
    }
    return div;
}
function send_execute_order_request(order_id, amount) {
    socket.emit('execute-order', { amount: amount, order: order_id });
}
export function buy_sell_callback(order_id, amount) {
    return (() => send_execute_order_request(order_id, amount));
}
export function clear_callback(order_id) {
    return () => socket.emit('clear-order', order_id);
}
export function new_ItemBulkLine(good_tag, buy_price, sell_price, amount, order_id) {
    const background_string = 'no-repeat left/contain url(/static/img/stash_' + good_tag + '.png)';
    return div(undefined, '', ['goods_type', good_tag], undefined, undefined, [
        div(undefined, '', ['goods_icon'], background_string, undefined, []),
        div(undefined, good_tag, ['goods_name'], undefined, undefined, []),
        div(undefined, buy_price.toString(), ['goods_avg_buy_price'], undefined, undefined, []),
        div(undefined, sell_price.toString(), ['goods_avg_sell_price'], undefined, undefined, []),
        div(undefined, amount.toString(), ['goods_amount_in_inventory'], undefined, undefined, []),
        div(undefined, 'Buy/Sell 1', ['market_button'], undefined, buy_sell_callback(order_id, 1), []),
        div(undefined, 'Buy/Sell 10', ['market_button'], undefined, buy_sell_callback(order_id, 10), []),
        div(undefined, 'Buy/Sell 50', ['market_button'], undefined, buy_sell_callback(order_id, 50), []),
        div(undefined, 'Remove', ['market_button'], undefined, clear_callback(order_id), [])
    ]);
}
export function edit_ItemBulkLine(line, good_tag, buy_price, sell_price, amount, order_id) {
    line.replaceWith(new_ItemBulkLine(good_tag, buy_price, sell_price, amount, order_id));
}
export function new_ItemBulkLineHeader() {
    return div(undefined, '', ['goods_type', 'header'], undefined, undefined, [
        div(undefined, 'Icon', ['goods_icon'], undefined, undefined, []),
        div(undefined, 'Good', ['goods_name'], undefined, undefined, []),
        div(undefined, 'Buy Price', ['goods_avg_buy_price'], undefined, undefined, []),
        div(undefined, 'Sell Price', ['goods_avg_sell_price'], undefined, undefined, []),
        div(undefined, 'Amount', ['goods_amount_in_inventory'], undefined, undefined, []),
        div(undefined, 'Action', [], undefined, undefined, [])
    ]);
}
