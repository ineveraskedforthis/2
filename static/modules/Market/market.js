import { material_icon_url, material_ids, stash_id_to_tag } from '../Stash/stash.js';
import { set_up_header_tab_callbacks } from "../../headers.js";
import { div } from "../../widgets/Div/custom_div.js";
import { List } from "../../widgets/List/list.js";
import { elementById, inputById, selectById } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js";
import { socket } from "../Socket/socket.js";
function send_execute_order_request(order_id, amount) {
    socket.emit('execute-order', { amount: amount, order: order_id });
}
export function buy_sell_callback(order_id, amount) {
    return (() => send_execute_order_request(order_id, amount));
}
export function clear_callback(order_id) {
    return () => socket.emit('clear-order', order_id);
}
const columns = [
    {
        header_text: "Icon",
        value: (item) => stash_id_to_tag[item.tag],
        type: "string",
        //width_style: "30px",
        image_path: (item) => "url(/static/img/stash_" + stash_id_to_tag[item.tag] + ".png",
        custom_style: ['goods-icon', "flex-0-0-30px"]
    },
    {
        header_text: "Name",
        value: (item) => stash_id_to_tag[item.tag],
        type: "string",
        //width_style: "100px",
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Price",
        value: (item) => item.price,
        type: "number",
        //width_style: "50px"
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Amount",
        value: (item) => item.amount,
        type: "number",
        //width_style: "50px"
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "You have:",
        value: (item) => {
            const character = globals.character_data;
            if (character == undefined)
                return 0;
            return character.stash[item.tag].value;
        },
        type: "number",
        //width_style: "50px"
        custom_style: ["flex-1-0-5"]
    },
    {
        value: (item) => "1",
        onclick: (item) => buy_sell_callback(item.id, 1),
        viable: (item) => {
            const character = globals.character_data;
            if (character == undefined)
                return false;
            if (FILTER_STATE.type == "sell")
                return (1 * item.price <= character.savings.value);
            return (character.stash[item.tag].value >= 1);
        },
        type: "string",
        //width_style: "50px"
        custom_style: ["flex-1-0-5"]
    },
    {
        value: (item) => "10",
        onclick: (item) => buy_sell_callback(item.id, 10),
        viable: (item) => {
            const character = globals.character_data;
            if (character == undefined)
                return false;
            if (FILTER_STATE.type == "sell")
                return (1 * item.price <= character.savings.value);
            return (character.stash[item.tag].value >= 1);
        },
        type: "string",
        //width_style: "50px"
        custom_style: ["flex-1-0-5"]
    },
    {
        value: (item) => "50",
        onclick: (item) => buy_sell_callback(item.id, 50),
        viable: (item) => {
            const character = globals.character_data;
            if (character == undefined)
                return false;
            if (FILTER_STATE.type == "sell")
                return (item.price <= character.savings.value);
            return (character.stash[item.tag].value >= 1);
        },
        type: "string",
        //width_style: "50px"
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Remove order",
        value: (item) => "X",
        onclick: (item) => clear_callback(item.id),
        viable: (item) => (globals.character_data?.id == item.owner_id),
        type: "string",
        //width_style: "100px"
        custom_style: ["flex-1-0-5"]
    }
];
let market_div_buy = elementById('goods_list_buy');
export const market_bulk = new List(market_div_buy);
market_bulk.columns = columns;
const FILTER_STATE = {
    type: "sell",
    per_good: []
};
function material_id_filter() {
    return (item) => {
        return FILTER_STATE.per_good[item.tag] && (item.typ == FILTER_STATE.type);
    };
}
market_bulk.filter = material_id_filter();
export function init_market_filters() {
    let filters = elementById('per_good_filters');
    for (let item_index of material_ids) {
        FILTER_STATE.per_good.push(false);
        console.log(item_index);
        const tag = stash_id_to_tag[item_index];
        console.log(tag);
        const filter_div = div(`filter_${tag}`, "", ["generic-button", "columns_container"], undefined, () => {
            FILTER_STATE.per_good[item_index] = !FILTER_STATE.per_good[item_index];
            elementById(`filter_${tag}`).classList.toggle("selected");
            market_bulk.filter = material_id_filter();
        }, [
            div(undefined, "", ["goods-icon", "small-square"], material_icon_url(tag), undefined, []),
            div(undefined, tag, [], undefined, undefined, [])
        ]);
        filters.appendChild(filter_div);
    }
    market_bulk.filter = material_id_filter();
}
export function init_market_bulk() {
    let clear_orders_button = elementById('clear_orders_button');
    let clear_auction_orders_button = elementById('clear_auction_orders_button');
    set_up_header_tab_callbacks([
        {
            element: elementById("market_sell_header"),
            callback: () => {
                FILTER_STATE.type = "sell";
                market_bulk.filter = material_id_filter();
            }
        },
        {
            element: elementById("market_buy_header"),
            callback: () => {
                FILTER_STATE.type = "buy";
                market_bulk.filter = material_id_filter();
            }
        }
    ]);
    elementById("market_sell_header").click();
    clear_orders_button.onclick = () => socket.emit('clear-orders');
    clear_auction_orders_button.onclick = () => socket.emit('clear-item-orders');
    let order_bulk_button = elementById('create_order_button');
    order_bulk_button.onclick = (() => {
        let material = selectById('create_order_material').value;
        let type = selectById('create_order_type').value;
        let amount = inputById('create_order_amount').value;
        let price = inputById('create_order_price').value;
        socket.emit(type, { material: Number(material), amount: Number(amount), price: Number(price) });
        // console.log(material, type, amount, price)
    });
    let order_button = elementById('create_auction_order_button');
    order_button.onclick = (() => {
        let item = JSON.parse(inputById('create_auction_order_item').value);
        let price = inputById('create_auction_order_price').value;
        socket.emit('sell-item', { index: Number(item.index), item_type: item.type, price: Number(price) });
    });
    socket.on('market-data', data => market_bulk.data = data);
}
