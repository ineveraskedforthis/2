import { generate_item_market_div, generate_market_header } from "../Divs/item.js";
import { socket } from "../globals.js";
const item_market_container = document.getElementById('auction_house_tab');
const item_market_data = [];
const control_container = document.querySelector('.auction_control');
const market_header = generate_market_header();
var selected = undefined;
var selected_div = undefined;
socket.on('item-market-data', data => { update_item_market(data); });
function send_buyout_request() {
    // let items = document.getElementsByName('market_item_list_radio') as NodeListOf<HTMLInputElement>;
    // let index = undefined;
    // for(let i = 0; i < items.length; i++) {
    //     if(items[i].checked)
    //         index = parseInt(items[i].value);
    //     }
    console.log('buyout ' + selected);
    socket.emit('buyout', selected);
}
export function build() {
    {
        let buyout_button = document.createElement('button');
        buyout_button.onclick = (() => send_buyout_request());
        buyout_button.innerHTML = 'buyout';
        control_container.appendChild(buyout_button);
    }
}
export function select_item(id, div) {
    return () => {
        if (selected != id) {
            selected = id;
            selected_div?.classList.remove('selected');
            div.classList.add('selected');
            selected_div = div;
        }
        else {
            selected_div?.classList.remove('selected');
            selected = undefined;
            selected_div = undefined;
        }
    };
}
export function update_item_market(data) {
    item_market_container.innerHTML = '';
    item_market_container.appendChild(market_header);
    for (let order of data) {
        const div = generate_item_market_div(order);
        if (order.id != undefined) {
            div.onclick = select_item(order.id, div);
            if (order.id == selected) {
                div.classList.add('selected');
            }
        }
        item_market_container.appendChild(div);
    }
    // console.log('update auction')
    // console.log(data)
    // let table = document.createElement('table');
    // {
    //     let row = table.insertRow()
    //     this.add_cell_to_row(row, 'owner_name');
    //     this.add_cell_to_row(row, '| item.tag');
    //     this.add_cell_to_row(row, '| buyout_price');
    //     // this.add_cell_to_row(row, '| current_price');
    //     // this.add_cell_to_row(row, '| time left')
    // }
    // for (let data_row of data) {
    //     let row = table.insertRow()
    //     this.add_cell_to_row(row, data_row.seller_name);
    //     {
    //         let cell = row.insertCell();
    //         let item_block = document.createElement('div')
    //         item_block.setAttribute('class', 'tooltip')
    //         item_block.innerHTML = data_row.item_name
    //         let span = document.createElement('span')
    //         span.setAttribute('class', 'tooltiptext');
    //         span.innerHTML = ''
    //         // for (let j of data_row.affixes){
    //         //     let affix = i.item['a' + j];
    //         //     if (affix != undefined){
    //         //         span.innerHTML = affix.tag + ' ' + affix.tier + ' | ';
    //         //     }
    //         // }
    //         item_block.appendChild(span)
    //         cell.appendChild(item_block)
    //     }
    //     this.add_cell_to_row(row, '| ' + data_row.price);
    //     {
    //         let cell = row.insertCell();
    //         let radio_button = document.createElement('input');
    //         radio_button.setAttribute('type', 'radio');
    //         radio_button.setAttribute('name', 'market_item_list_radio');
    //         radio_button.setAttribute('value', data_row.id);
    //         cell.appendChild(radio_button);
    //     }
    // }
    // this.table_container.innerHTML = '';
    // this.table_container.appendChild(table);
}
build();
