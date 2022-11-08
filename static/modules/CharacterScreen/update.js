import { generate_dummy_item_backpack_div, generate_item_backpack_div, generate_name } from "../Divs/item.js";
const table_items = document.getElementById('backpack_weapon_tab');
const item_select_div = document.getElementById('create_auction_order_item');
const header_div = generate_dummy_item_backpack_div();
const EQUIPMENT_TAGS = ['weapon', 'secondary', 'body', 'legs', 'foot', 'head', 'arms'];
function add_option(name, type, id) {
    let option = document.createElement('option');
    option.value = JSON.stringify({ index: id, type: type });
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
        if ((weapon != null) && (weapon != undefined) && (weapon.backpack_index != undefined)) {
            const item = generate_item_backpack_div(weapon);
            item.classList.add('item');
            table_items.appendChild(item);
            add_option(generate_name(weapon), 'weapon', weapon.backpack_index);
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
            let tmp = generate_item_backpack_div(item);
            row.innerHTML = tmp.innerHTML;
            row.classList.add(...tmp.classList);
            row.classList.add('item');
        }
    }
}
