import { generate_name } from "../Divs/item.js";
import { update_backpack, update_equip } from "./update.js"

export const EQUIPMENT_TAGS = ['weapon', 'secondary', 'body', 'legs', 'foot', 'head', 'arms'];

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

    socket.emit('ench', index)
    socket.emit('char-info-detailed');
}

function send_disenchant_request(socket) {
    let items = document.getElementsByName('sell_item');
    let index = undefined;
    for(let i = 0; i < items.length; i++) {
        if (items[i].checked) index = parseInt(items[i].value);
    }

    socket.emit('disench', index)
    socket.emit('char-info-detailed');
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

        for (let i of EQUIPMENT_TAGS) {
            let tmp = document.getElementById('eq_' + i);
            
            ((tag) => {tmp.onclick = () => {socket.emit('unequip', tag); socket.emit('char-info-detailed')}})(i)

            let name_label = document.createElement('div')
            name_label.innerHTML = i
            name_label.classList.add('slot_label')
            tmp.appendChild(name_label)

            let item_label = document.createElement('div')
            item_label.classList.add('item')
            item_label.innerHTML = "???"
            tmp.appendChild(item_label)
        
        }


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

        // this.button = document.createElement('button');
        // (() => 
        //         this.button.onclick = () => send_eat_request(this.socket)
        // )();
        // this.button.innerHTML = 'eat';
        // this.actions_div.appendChild(this.button);

        // this.button = document.createElement('button');
        // (() => 
        //         this.button.onclick = () => send_clean_request(this.socket)
        // )();
        // this.button.innerHTML = 'clean';
        // this.actions_div.appendChild(this.button);

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


        //craft
        // HandleAction.act(_div = document.getElementById('craft')
        // {   
        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_craft_food_request(this.socket)
        //         )();
        //         button.innerHTML = 'craft_food';
        //         HandleAction.act(_div.appendChild(button);
        //     }

        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_craft_clothes_request(this.socket)
        //         )();
        //         button.innerHTML = 'craft_clothes';
        //         HandleAction.act(_div.appendChild(button);
        //     }

        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_enchant_request(this.socket)
        //         )();
        //         button.innerHTML = 'enchant selected';
        //         HandleAction.act(_div.appendChild(button);
        //     }

        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_disenchant_request(this.socket)
        //         )();
        //         button.innerHTML = 'disenchant selected (item will be destroyed)';
        //         HandleAction.act(_div.appendChild(button);
        //     }
        // }

        // console.log('character_screen_loaded')
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
