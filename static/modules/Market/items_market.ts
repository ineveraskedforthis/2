import { ItemData } from "../../../shared/inventory.js";
import { generate_item_market_div, generate_market_header } from "../Divs/item.js";
import { socket } from "../globals.js"


const item_market_container = document.getElementById('auction_house_tab')!
const item_market_data = []
const control_container = document.querySelector('.auction_control')!;

const market_header = generate_market_header()

var selected:undefined|number = undefined
var selected_div: undefined|HTMLElement = undefined


socket.on('item-market-data', data => {update_item_market(data)});

function send_buyout_request() {
    // let items = document.getElementsByName('market_item_list_radio') as NodeListOf<HTMLInputElement>;
    // let index = undefined;

    // for(let i = 0; i < items.length; i++) {
    //     if(items[i].checked)
    //         index = parseInt(items[i].value);
    //     }

    console.log('buyout ' + selected)
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

export function select_item(id: number, div: HTMLElement) {
    return () => {
        if (selected != id) {
            selected = id
            selected_div?.classList.remove('selected')
            div.classList.add('selected')
            selected_div = div
        } else {
            selected_div?.classList.remove('selected')
            selected = undefined
            selected_div = undefined
        }        
    }
}

export function update_item_market(data: ItemData[]) {
    item_market_container.innerHTML = ''

    item_market_container.appendChild(market_header)

    for (let order of data) {
        const div = generate_item_market_div(order)
        if (order.id != undefined) {
            div.onclick = select_item(order.id, div)
            if (order.id == selected) {
                div.classList.add('selected')
            }
        }

        item_market_container.appendChild(div)
    }
}

build()