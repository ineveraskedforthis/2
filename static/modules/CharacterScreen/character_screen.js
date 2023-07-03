import { generate_name } from "../Divs/item.js";
import { update_backpack, update_equip } from "./update.js"

// export const EQUIPMENT_TAGS = ['weapon', 'secondary', 'body', 'legs', 'foot', 'head', 'arms'];

let item_select_div = document.getElementById('create_auction_order_item')

function send_update_request(socket) {
    socket.emit('char-info-detailed');
}



function send_eat_request(socket) {
    socket.emit('eat');
    socket.emit('char-info-detailed');
}

function send_clean_request(socket) {
    socket.emit('clean');
    socket.emit('char-info-detailed');
}

function send_craft_food_request(socket) {
    socket.emit('char-info-detailed');
}

function send_craft_clothes_request(socket) {
    socket.emit('cclothes')
    socket.emit('char-info-detailed');
}

function send_enchant_request(socket) {
    let items = document.getElementsByName('sell_item');
    let index = undefined;
    for(let i = 0; i < items.length; i++) {
        if (items[i].checked) index = parseInt(items[i].value);
    }

    socket.emit('enchant', index)
}

function send_disenchant_request(socket) {
    let items = document.getElementsByName('sell_item');
    let index = undefined;
    for(let i = 0; i < items.length; i++) {
        if (items[i].checked) index = parseInt(items[i].value);
    }

    socket.emit('disenchant', index)
}

function get_item_image(tag) {
    return "background: no-repeat center/100% url(/static/img/" + tag + ".png);"
}



function send_sell_item_request(socket) {

    let items = document.getElementsByName('sell_item');
    let index = undefined;

    for(let i = 0; i < items.length; i++) {
        if(items[i].checked)
            index = parseInt(items[i].value);
    }
    
    let buyout_price = document.getElementById('buyout_price').value;
    let starting_price = document.getElementById('starting_price').value;

    socket.emit('sell-item', {index: index, buyout_price: buyout_price, starting_price: starting_price});
}

export class CharacterScreen {
    constructor(socket) {
        this.data = {}
        this.socket = socket;




        this.stats_div = document.getElementById('stats');
        this.inventory_div = document.getElementById('inventory');
        this.equip_div = document.getElementById('equip')
        this.actions_div =  document.getElementById('character_screen_actions');

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_update_request(this.socket)
        )();
        this.button.innerHTML = 'update';
        this.actions_div.appendChild(this.button);

        this.table_weapon = document.getElementById('backpack_weapon_tab');
        this.table_armour = document.getElementById('backpack_armour_tab');



        this.inventory_stash_div = document.getElementById('inventory_stash')
        this.misc = document.createElement('misc');

        this.stats_div.appendChild(this.misc);

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_sell_item_request(this.socket)
        )();
        this.button.innerHTML = 'sell selected item';
        this.actions_div.appendChild(this.button);

        {
            let label = document.createElement('p');
            label.innerHTML = 'starting price'
            this.actions_div.appendChild(label);

            let form = document.createElement('input');
            form.setAttribute('id', 'starting_price');
            this.actions_div.appendChild(form);
        }

        {
            let label = document.createElement('p');
            label.innerHTML = 'buyout price'
            this.actions_div.appendChild(label);

            let form = document.createElement('input');
            form.setAttribute('id', 'buyout_price');
            this.actions_div.appendChild(form);
        }
    }

    update_stash(data) {

    }

    update_equip(data) {
        update_equip(data)
        update_backpack(data)
    }

    update(data) {
        this.misc.innerHTML = '';
        for (let i in data.stats) {
            let stats_line = document.createElement('p');
            stats_line.append(document.createTextNode(`${i}: ${data.stats[i]}`));
            this.misc.appendChild(stats_line);
        }

        let resists_label = document.createElement('p')
        resists_label.innerHTML = 'resists'; 
        this.misc.appendChild(resists_label);
        for (let i in data.resists) {
            let other_line = document.createElement('p');
            other_line.append(document.createTextNode(`${i}: ${data.resists[i]}`))
            this.misc.appendChild(other_line);
        }
    }
}
