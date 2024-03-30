import { stash_id_to_tag } from "../../bulk_tags.js";
import { set_up_header_with_strings } from "../../headers.js";
import { socket } from "../../modules/globals.js";
import { new_ItemBulkLine, new_ItemBulkLineHeader } from "../ItemBulkLine/line_bulk.js";
import { new_list, sort_number, sort_string } from "../List/list.js";
const fields = [
    { name: 'Icon', field: 'goods_icon', sortable: false, type: 'image' },
    { name: 'Good', field: 'goods_name', sortable: true, type: 'text' },
    { name: 'Buy Price', field: 'goods_avg_buy_price', sortable: true, type: 'number' },
    { name: 'Sell Price', field: 'goods_avg_sell_price', sortable: true, type: 'number' },
    { name: 'Amount', field: 'goods_amount_in_inventory', sortable: true, type: 'number' },
    { name: 'Action', field: 'order_actions', sortable: false, type: 'button' }
];
let market_div_buy = document.getElementById('goods_list_buy');
let market_div_sell = document.getElementById('goods_list_sell');
let clear_orders_button = document.getElementById('clear_orders_button');
let clear_auction_orders_button = document.getElementById('clear_auction_orders_button');
const market_list_buy = new_list(market_div_buy);
const market_list_sell = new_list(market_div_sell);
set_up_header_with_strings([
    {
        element: "market_sell_header",
        connected_element: "goods_sell_wrapper"
    },
    {
        element: "market_buy_header",
        connected_element: "goods_buy_wrapper"
    }
]);
clear_orders_button.onclick = () => socket.emit('clear-orders');
clear_auction_orders_button.onclick = () => socket.emit('clear-item-orders');
let market_buy_div_header = document.getElementById('goods_list_buy_header');
market_buy_div_header.appendChild(new_ItemBulkLineHeader(market_list_buy));
let market_sell_div_header = document.getElementById('goods_list_sell_header');
market_sell_div_header.appendChild(new_ItemBulkLineHeader(market_list_sell));
export function update_market(data) {
    console.log('update market');
    // console.log(data)
    market_div_sell.innerHTML = "";
    market_div_buy.innerHTML = "";
    for (let remaining_line = 0; remaining_line < data.length; remaining_line++) {
        const item = data[remaining_line];
        const tag = stash_id_to_tag[item.tag];
        if (item.typ == "sell") {
            market_div_sell.appendChild(new_ItemBulkLine(tag, item.price, item.amount, item.id));
        }
        else {
            market_div_buy.appendChild(new_ItemBulkLine(tag, item.price, item.amount, item.id));
        }
    }
    if (market_list_buy.sorted_field == 'goods_name') {
        sort_string(market_list_buy);
    }
    else {
        sort_number(market_list_buy);
    }
    if (market_list_sell.sorted_field == 'goods_name') {
        sort_string(market_list_sell);
    }
    else {
        sort_number(market_list_sell);
    }
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
