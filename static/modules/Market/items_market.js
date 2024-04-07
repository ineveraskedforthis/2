import { generate_item_market_div, generate_market_header } from "../Divs/item.js";
import { socket } from "../globals.js";
const item_market_container = document.getElementById('auction_house_tab');
const item_market_data = [];
const control_container = document.querySelector('.auction_control');
const market_header = generate_market_header();
var selected = undefined;
var selecter_owner = undefined;
var selected_div = undefined;
export function init_market_items() {
    socket.on('item-market-data', data => { update_item_market(data); });
    build();
}
function send_buyout_request() {
    // let items = document.getElementsByName('market_item_list_radio') as NodeListOf<HTMLInputElement>;
    // let index = undefined;
    // for(let i = 0; i < items.length; i++) {
    //     if(items[i].checked)
    //         index = parseInt(items[i].value);
    //     }
    // console.log('buyout', {char_id: selecter_owner, item_id: selected})
    socket.emit('buyout', { char_id: selecter_owner, item_id: selected });
}
export function build() {
    {
        let buyout_button = document.createElement('button');
        buyout_button.onclick = (() => send_buyout_request());
        buyout_button.innerHTML = 'buyout';
        control_container.appendChild(buyout_button);
    }
}
export function select_item(id, owner_id, div) {
    return () => {
        selected = id;
        selecter_owner = owner_id;
        selected_div?.classList.remove('selected');
        div.classList.add('selected');
        selected_div = div;
    };
}
export function update_item_market(data) {
    console.log("updating market");
    console.log(data);
    item_market_container.innerHTML = '';
    item_market_container.appendChild(market_header);
    for (let order of data) {
        const div = generate_item_market_div(order);
        if (order.id == undefined)
            continue;
        if (order.seller_id == undefined)
            continue;
        div.onclick = select_item(order.id, order.seller_id, div);
        if (order.id == selected && order.seller_id == selecter_owner) {
            div.classList.add('selected');
        }
        item_market_container.appendChild(div);
    }
}
