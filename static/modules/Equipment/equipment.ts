import { EquipSlotStorage } from "@content/content.js"
import { Socket } from "../../../shared/battle_data.js"
import { EquipSlotData, ItemData } from "../../../shared/inventory.js"
import { Column, List } from "../../widgets/List/list.js"
import { damage_types } from "../Constants/inventory.js"
import { elementById } from "../HTMLwrappers/common.js"
import { socket } from "../Socket/socket.js"
import { generate_item_name } from "../StringGeneration/string_generation.js"


function send_switch_weapon_request(socket: Socket) {
    console.log("send switch weapon request")
    socket.emit('switch-weapon')
}

const columns_mini:Column<EquipSlotData>[] = [
    {
        header_text: "Name",
        value: (item) => {
            const name = document.createElement('div')
            const name_string = item.item.name
            name.innerHTML = name_string
            name.classList.add('item_tier_' + Math.min(item.item.affixes, 4))
            name.classList.add('centered-box')
            name.classList.add('width-125')
            return name
        },
        type: "html",
        custom_style: ["flex-1-0-5"]
    },

    {
        value: (item) => "X",
        onclick: (item) => () => {socket.emit('unequip', item.equip_slot)},
        viable: (item) => {
            return true
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },


]

const columns:Column<EquipSlotData>[] = [
    {
        header_text: "Item type",
        value: (item) => EquipSlotStorage.get(item.item.item_type).name,
        type: "string",
        custom_style: ["flex-1-0-5"]
    },


    {
        header_text: "Slot",
        value: (item) => EquipSlotStorage.from_string(item.equip_slot).name,
        type: "string",
        custom_style: ["flex-1-0-5"]
    },

    {
        value: (item) => "Unequip",
        onclick: (item) => () => {socket.emit('unequip', item.equip_slot)},
        viable: (item) => {
            return true
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },

    {
        header_text: "Name",
        value: (item) => {
            const name = document.createElement('div')
            const name_string = generate_item_name(item.item)
            name.innerHTML = name_string
            name.classList.add('item_tier_' + Math.min(item.item.affixes, 4))
            name.classList.add('centered-box')
            name.classList.add('width-125')

            return name
        },
        type: "html",
        custom_style: ["flex-1-0-5"]
    },

    {
        header_text: "Durability",
        value: (item) => item.item.durability,
        type: "number",
        custom_style: ["flex-0-0-5"]
    },


    {
        header_background: 'url(/static/img/small_icons/bow.png)',
        value: (item) => item.item.is_weapon ? item.item.ranged_damage : 0,
        type: "number",
        custom_style: ["flex-0-0-30px", "centered_background"]
    },
]

const dmg_col : Column<EquipSlotData> = {
    header_text: "D",
    value: (item) => {
        let total = 0
        for (let d of damage_types) {
            total += item.item.is_weapon ? item.item.damage[d] : 0
        }
        return total
    },
    type: "number",
    custom_style: ["flex-0-0-50px"]
}


columns.push(dmg_col)
columns_mini.push(dmg_col)


for (let d of damage_types) {
    columns.push(
        {
            header_background: 'url(/static/img/small_icons/'+ d + '.png)',
            value: (item) => item.item.is_weapon ? item.item.damage[d] : 0,
            type: "number",
            custom_style: ["flex-0-0-30px", "centered_background"]
        }
    )
}

const res_col : Column<EquipSlotData> = {
    header_text: "R",
    value: (item) => {
        let total = 0
        for (let d of damage_types) {
            total += item.item.resists[d]
        }
        return total
    },
    type: "number",
    custom_style: ["flex-0-0-50px"]
}

columns.push(res_col)
columns_mini.push(res_col)

for (let d of damage_types) {
    columns.push(
        {
            header_background: 'url(/static/img/small_icons/'+ d + '.png)',
            value: (item) => item.item.resists[d],
            type: "number",
            custom_style: ["flex-0-0-30px", "centered_background"]
        }
    )
}


export function init_equipment_screen(container: HTMLElement, socket: Socket) {
    const equip_list = new List<EquipSlotData>(container)
    equip_list.columns = columns

    elementById('send_switch_weapon_request').onclick = () => send_switch_weapon_request(socket)

    return equip_list
}

export function init_equipment_screen_mini(container: HTMLElement) {
    const equip_list = new List<EquipSlotData>(container)
    equip_list.columns = columns_mini
    return equip_list
}