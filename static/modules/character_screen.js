
export const EQUIPMENT_TAGS = ['right_hand', 'body', 'legs', 'foot', 'head', 'arms'];




function send_update_request(socket) {
    socket.emit('char-info-detailed');
}

function send_equip_message(socket, index) {
    socket.emit('equip', index);
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
    socket.emit('cfood')
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
        let tmp = document.getElementById('eq_' + i + '_image');
            ((tag) => {tmp.onclick = () => {socket.emit('unequip', tag); socket.emit('char-info-detailed')}})(i)
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

        this.table = document.createElement('table');
        this.table = document.getElementById('inventory_items');
        this.inventory_stash_div = document.getElementById('inventory_stash')
        this.misc = document.createElement('misc');
        let label1 = document.createElement('p');

        label1.innerHTML = 'Equipment:';
        this.equip_div.appendChild(label1);

        this.stats_div.appendChild(this.misc);

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_eat_request(this.socket)
        )();
        this.button.innerHTML = 'eat';
        this.actions_div.appendChild(this.button);

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_clean_request(this.socket)
        )();
        this.button.innerHTML = 'clean';
        this.actions_div.appendChild(this.button);

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
        this.craft_div = document.getElementById('craft')
        {   
            {
                let button = document.createElement('button');
                (() => 
                        button.onclick = () => send_craft_food_request(this.socket)
                )();
                button.innerHTML = 'craft_food';
                this.craft_div.appendChild(button);
            }

            {
                let button = document.createElement('button');
                (() => 
                        button.onclick = () => send_craft_clothes_request(this.socket)
                )();
                button.innerHTML = 'craft_clothes';
                this.craft_div.appendChild(button);
            }

            {
                let button = document.createElement('button');
                (() => 
                        button.onclick = () => send_enchant_request(this.socket)
                )();
                button.innerHTML = 'enchant selected';
                this.craft_div.appendChild(button);
            }

            {
                let button = document.createElement('button');
                (() => 
                        button.onclick = () => send_disenchant_request(this.socket)
                )();
                button.innerHTML = 'disenchant selected (item will be destroyed)';
                this.craft_div.appendChild(button);
            }
        }

        console.log('character_screen_loaded')
    }

    update_backpack(data) {
        let inv = data.backpack;
        this.table.innerHTML = '';
        for (let i = 0; i < inv.length; i++) {
            if (inv[i] != null) {
                let row = this.table.insertRow();
                let type = row.insertCell(0); 
                type.innerHTML = inv[i].tag
                for (let j = 0; j < inv[i].affixes; j++){
                    let affix = inv[i]['a' + j];
                    let a = row.insertCell(j + 1);
                    if (affix != undefined){
                        a.innerHTML = affix.tag + ' ' + affix.tier;
                    }
                }
                for (let j = inv[i].affixes + 1; j < 8; j++) {
                    row.insertCell(j)
                }
                let button = document.createElement('button');
                button.innerHTML = 'equip';
                let tmp = row.insertCell(8)
                tmp.appendChild(button);
                ((index) => 
                    button.onclick = () => send_equip_message(this.socket, index)
                )(i)
                tmp = row.insertCell(9);
                let radio_button = document.createElement('input');
                radio_button.setAttribute('type', 'radio');
                radio_button.setAttribute('name', 'sell_item');
                radio_button.setAttribute('value', i);
                tmp.appendChild(radio_button);
            }
        }
        
    }

    update_stash(data) {
        for (let tag in data) {
            let div = this.inventory_stash_div.querySelector('.' + tag + ' > .goods_amount_in_inventory')
            if (div != null)  {
                div.innerHTML = data[tag]
            }            
        }
    }

    update_equip(data) {
        for (let i = 0; i < EQUIPMENT_TAGS.length; i++) {
            let tag = EQUIPMENT_TAGS[i]
            let item = data[tag]
            let image = document.getElementById('eq_' + tag + '_image');
            image.style = get_item_image(item.tag)
            let tooltip = document.getElementById('eq_' + tag + '_tooltip')
            tooltip.innerHTML = ''
            let tmp = document.createElement('div');
            let tmp2 = document.createElement('p');
            tmp2.innerHTML = item.tag
            tmp.appendChild(tmp2)
            for (let j = 0; j < item.affixes; j++){
                let affix = item['a' + j];
                if (affix != undefined){
                    let p = document.createElement('p')
                    p.innerHTML = affix.tag + ' ' + affix.tier;
                    tmp.appendChild(p)
                }
            }
            tooltip.appendChild(tmp)
        }
        this.update_backpack(data)
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
