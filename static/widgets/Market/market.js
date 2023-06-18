import { stash_id_to_tag } from "../../bulk_tags.js";
import { socket } from "../../modules/globals.js";
import { edit_ItemBulkLine, new_ItemBulkLine, new_ItemBulkLineHeader, sort_market } from "../ItemBulkLine/line_bulk.js";
let market_div = document.querySelector('.goods_list');
let market_div_header = document.querySelector('.goods_list_header');
let clear_orders_button = document.getElementById('clear_orders_button');
let clear_auction_orders_button = document.getElementById('clear_auction_orders_button');
let current_sort_var = { field: 'goods_name', direction: 'asc' };
clear_orders_button.onclick = () => socket.emit('clear-orders');
clear_auction_orders_button.onclick = () => socket.emit('clear-item-orders');
market_div_header.appendChild(new_ItemBulkLineHeader(market_div, current_sort_var));
export function update_market(data) {
    console.log('update market');
    // console.log(data)
    let current_line = 0;
    for (let child of market_div.children) {
        if (child.classList.contains('header')) {
            continue;
        }
        if (current_line >= data.length) {
            child.classList.add('hidden');
        }
        else {
            const item = data[current_line];
            let sell_price = '';
            let buy_price = '';
            if (item.typ == 'sell') {
                sell_price = item.price;
            }
            if (item.typ == 'buy') {
                buy_price = item.price;
            }
            let tag = stash_id_to_tag[item.tag];
            edit_ItemBulkLine(child, tag, buy_price, sell_price, item.amount, item.id);
            child.classList.remove('hidden');
            current_line++;
        }
    }
    for (let remaining_line = current_line; remaining_line < data.length; remaining_line++) {
        const item = data[remaining_line];
        const tag = stash_id_to_tag[item.tag];
        // market_div.appendChild(new_ItemBulkLine(data[remaining_line].tag, data[remaining_line].price, data[remaining_line].price, data[remaining_line].amount, data[remaining_line].id));
        market_div.appendChild(new_ItemBulkLine(tag, item.price, item.price, item.amount, item.id));
    }
    sort_market(market_div, 'keep', current_sort_var, 'keep');
}
{
    let order_button = document.getElementById('create_order_button');
    order_button.onclick = (() => {
        let material = document.getElementById('create_order_material').value;
        let type = document.getElementById('create_order_type').value;
        let amount = document.getElementById('create_order_amount').value;
        let price = document.getElementById('create_order_price').value;
        socket.emit(type, { material: Number(material), amount: Number(amount), price: Number(price) });
        // console.log(material, type, amount, price)
    });
}
{
    let order_button = document.getElementById('create_auction_order_button');
    order_button.onclick = (() => {
        let item = JSON.parse(document.getElementById('create_auction_order_item').value);
        let price = document.getElementById('create_auction_order_price').value;
        socket.emit('sell-item', { index: Number(item.index), item_type: item.type, price: Number(price) });
        // console.log(material, type, amount, price)
    });
}
socket.on('market-data', data => update_market(data));
