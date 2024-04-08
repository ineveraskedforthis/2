import { EquipSocket, equip_slot } from "../../../shared/inventory.js";
import { EQUIPMENT_TAGS } from "../Constants/inventory.js";
import { generate_dummy_item_backpack_div, generate_item_backpack_div } from "../Divs/item.js";
import { generate_item_name } from "../StringGeneration/string_generation.js";
import { elementById } from "../HTMLwrappers/common.js";
import { socket } from "../Socket/socket.js";


const table_items = document.getElementById('backpack_weapon_tab')!
const item_select_div = document.getElementById('create_auction_order_item') as HTMLSelectElement

const header_div = generate_dummy_item_backpack_div()
const equip_block = elementById('equip')!

export function init_equipment() {
    for (let i of EQUIPMENT_TAGS) {
        const tmp = document.createElement('div');
        tmp.classList.add(... ['item_frame']);
        tmp.id = 'eq_' + i;
        ((tag) => {tmp.onclick = () => {socket.emit('unequip', tag); socket.emit('char-info-detailed')}})(i)
        let name_label = document.createElement('div')
        name_label.innerHTML = i
        name_label.classList.add('slot_label')
        tmp.appendChild(name_label)

        let item_label = document.createElement('div')
        item_label.classList.add('item')
        item_label.innerHTML = "???"
        tmp.appendChild(item_label)

        equip_block.appendChild(tmp)
    }
}

function add_option(name: string, id: number) {
    let option = document.createElement('option')
    option.value = JSON.stringify({index: id})
    option.innerHTML = name
    item_select_div.appendChild(option)
}

export function update_backpack(data: EquipSocket) {
    let inv = data.backpack;
    table_items.innerHTML = '';
    item_select_div.innerHTML = ''

    console.log(inv)
    table_items.appendChild(header_div)

    for (let i = 0; i < inv.items.length; i++) {
        const weapon = inv.items[i]
        console.log(weapon)

        if ((weapon != null) && (weapon != undefined)) {
            const item = generate_item_backpack_div(weapon, i)
            item.classList.add('item');
            table_items.appendChild(item)
            add_option(generate_item_name(weapon), i)
        }
    }
}

export function update_equip_list(data: EquipSocket) {
    for (let i = 0; i < EQUIPMENT_TAGS.length; i++) {

        let tag = EQUIPMENT_TAGS[i]
        let item = data.equip[tag]

        console.log(tag)

        let row = document.querySelector('#eq_' + tag + '> .item')!

        row.classList.remove(... row.classList);
        if (item == undefined) {
            row.innerHTML = 'empty'
            row.classList.add('item')
        } else {
            let tmp = generate_item_backpack_div(item, undefined)
            row.innerHTML = tmp.innerHTML
            row.classList.add(... tmp.classList)
            row.classList.add('item')
        }
    }
}