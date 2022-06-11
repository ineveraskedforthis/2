
export const EQUIPMENT_TAGS = ['right_hand', 'body', 'legs', 'foot', 'head', 'arms'];




function send_update_request(socket) {
    socket.emit('char-info-detailed');
}

function send_equip_weapon_message(socket, index) {
    socket.emit('equip-weapon', index);
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
            item_label.classList.add('item_label')
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
        // this.craft_div = document.getElementById('craft')
        // {   
        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_craft_food_request(this.socket)
        //         )();
        //         button.innerHTML = 'craft_food';
        //         this.craft_div.appendChild(button);
        //     }

        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_craft_clothes_request(this.socket)
        //         )();
        //         button.innerHTML = 'craft_clothes';
        //         this.craft_div.appendChild(button);
        //     }

        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_enchant_request(this.socket)
        //         )();
        //         button.innerHTML = 'enchant selected';
        //         this.craft_div.appendChild(button);
        //     }

        //     {
        //         let button = document.createElement('button');
        //         (() => 
        //                 button.onclick = () => send_disenchant_request(this.socket)
        //         )();
        //         button.innerHTML = 'disenchant selected (item will be destroyed)';
        //         this.craft_div.appendChild(button);
        //     }
        // }

        console.log('character_screen_loaded')
    }

    update_backpack(data) {
        let inv = data.backpack;
        this.table_weapon.innerHTML = '';
        this.table_armour.innerHTML = '';
        for (let i = 0; i < inv.weapons.length; i++) {
            if (inv.weapons[i] != null) {
                let weapon = inv.weapons[i]
                let row = this.table_weapon.insertRow();
                let type = row.insertCell(0); 
                type.innerHTML = weapon.tag
                for (let j = 0; j < weapon.affixes; j++){
                    let affix = weapon.affixes_list[j];
                    let a = row.insertCell(j + 1);
                    if (affix != undefined){
                        a.innerHTML = affix.tag + ' ' + affix.tier;
                    }
                }
                for (let j = weapon.affixes + 1; j < 8; j++) {
                    row.insertCell(j)
                }
                let button = document.createElement('button');
                button.innerHTML = 'equip';
                let tmp = row.insertCell(8)
                tmp.appendChild(button);
                ((index) => 
                    button.onclick = () => send_equip_weapon_message(this.socket, index)
                )(i)
                // tmp = row.insertCell(9);
                // let radio_button = document.createElement('input');
                // radio_button.setAttribute('type', 'radio');
                // radio_button.setAttribute('name', 'sell_item');
                // radio_button.setAttribute('value', i);
                // tmp.appendChild(radio_button);
            }
        }
        
        for (let i = 0; i < inv.armours.length; i++) {
            if (inv.armours[i] != null) {
                let armour = inv.armours[i]
                let row = this.table_armour.insertRow();
                let type = row.insertCell(0); 
                type.innerHTML = armour.tag
                for (let j = 0; j < armour.affixes; j++){
                    let affix = armour.affixes_list[j];
                    let a = row.insertCell(j + 1);
                    if (affix != undefined){
                        a.innerHTML = affix.tag + ' ' + affix.tier;
                    }
                }
                for (let j = armour.affixes + 1; j < 8; j++) {
                    row.insertCell(j)
                }

                let button = document.createElement('button');
                button.innerHTML = 'equip';
                let tmp = row.insertCell(8)
                tmp.appendChild(button);
                ((index) => 
                    button.onclick = () => send_equip_armour_message(this.socket, index)
                )(i)


                // tmp = row.insertCell(9);
                // let radio_button = document.createElement('input');
                // radio_button.setAttribute('type', 'radio');
                // radio_button.setAttribute('name', 'sell_item');
                // radio_button.setAttribute('value', i);
                // tmp.appendChild(radio_button);
            }
        }

        
    }

    update_stash(data) {

    }

    update_equip(data) {
        console.log('update_equip')
        for (let i = 0; i < EQUIPMENT_TAGS.length; i++) {
            
            let tag = EQUIPMENT_TAGS[i]
            let item = data[tag]
            console.log(tag)
            console.log(item)
            // let image = document.getElementById('eq_' + tag + '_image');
            // image.style = get_item_image(item.tag)
            let label = document.querySelector('#eq_' + tag + '> .item_label')
            console.log(item?.tag)
            label.innerHTML = item?.tag||'empty'

            let tooltip = document.getElementById('eq_' + tag + '_tooltip')
            tooltip.innerHTML = ''
            let tmp = document.createElement('div');
            let tmp2 = document.createElement('p');
            tmp2.innerHTML = item?.tag||'empty'
            tmp.appendChild(tmp2)
            for (let j = 0; j < item?.affixes; j++){
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
