import { generate_dummy_item_backpack_div, generate_item_backpack_div, generate_name } from "../Divs/item.js";
import { socket } from "../globals.js";
const table_items = document.getElementById('backpack_weapon_tab');
const item_select_div = document.getElementById('create_auction_order_item');
const header_div = generate_dummy_item_backpack_div();
export const EQUIPMENT_TAGS = ['weapon', 'socks', 'shirt', 'secondary', 'left_pauldron', 'mail', 'right_pauldron', 'left_gauntlet', 'right_gauntlet', 'boots', 'helmet', 'pants', 'belt', 'dress', 'amulet', 'robe'];
const equip_block = document.getElementById('equip');
for (let i of EQUIPMENT_TAGS) {
    const tmp = document.createElement('div');
    tmp.classList.add(...['item_frame']);
    tmp.id = 'eq_' + i;
    ((tag) => { tmp.onclick = () => { socket.emit('unequip', tag); socket.emit('char-info-detailed'); }; })(i);
    let name_label = document.createElement('div');
    name_label.innerHTML = i;
    name_label.classList.add('slot_label');
    tmp.appendChild(name_label);
    let item_label = document.createElement('div');
    item_label.classList.add('item');
    item_label.innerHTML = "???";
    tmp.appendChild(item_label);
    equip_block.appendChild(tmp);
}
function add_option(name, id) {
    let option = document.createElement('option');
    option.value = JSON.stringify({ index: id });
    option.innerHTML = name;
    item_select_div.appendChild(option);
}
export function update_backpack(data) {
    let inv = data.backpack;
    table_items.innerHTML = '';
    item_select_div.innerHTML = '';
    console.log(inv);
    table_items.appendChild(header_div);
    for (let i = 0; i < inv.items.length; i++) {
        const weapon = inv.items[i];
        console.log(weapon);
        if ((weapon != null) && (weapon != undefined)) {
            const item = generate_item_backpack_div(weapon, i);
            item.classList.add('item');
            table_items.appendChild(item);
            add_option(generate_name(weapon), i);
        }
    }
}
export function update_equip(data) {
    for (let i = 0; i < EQUIPMENT_TAGS.length; i++) {
        let tag = EQUIPMENT_TAGS[i];
        let item = data.equip[tag];
        console.log(tag);
        let row = document.querySelector('#eq_' + tag + '> .item');
        row.classList.remove(...row.classList);
        if (item == undefined) {
            row.innerHTML = 'empty';
            row.classList.add('item');
        }
        else {
            let tmp = generate_item_backpack_div(item, i);
            row.innerHTML = tmp.innerHTML;
            row.classList.add(...tmp.classList);
            row.classList.add('item');
        }
    }
}
