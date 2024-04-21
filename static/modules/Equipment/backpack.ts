import { EquipSlotStorage } from "@content/content.js"
import { ItemBackpackData } from "../../../shared/inventory.js"
import { Column, List } from "../../widgets/List/list.js"
import { damage_types } from "../Constants/inventory.js"
import { elementById, selectById } from "../HTMLwrappers/common.js"
import { socket } from "../Socket/socket.js"
import { generate_item_name } from "../StringGeneration/string_generation.js"

const columns_mini:Column<ItemBackpackData>[] = [
    {
        header_text: "Name",
        value: (item) => {
            const name = document.createElement('div')
            const name_string = item.name
            name.innerHTML = name_string
            name.classList.add('item_tier_' + Math.min(item.affixes, 4))
            name.classList.add('centered-box')
            name.classList.add('width-125')
            return name
        },
        type: "html",
        custom_style: ["flex-1-0-5"]
    },

    {
        value: (item) => "E",
        onclick: (item) => () => {socket.emit('equip', item.backpack_index)},
        viable: (item) => {
            return true
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },
]

const columns:Column<ItemBackpackData>[] = [
    {
        header_text: "Item type",
        value: (item) => EquipSlotStorage.get(item.item_type).name,
        type: "string",
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Name",
        value: (item) => {
            const name = document.createElement('div')
            const name_string = generate_item_name(item)
            name.innerHTML = name_string
            name.classList.add('item_tier_' + Math.min(item.affixes, 4))
            name.classList.add('centered-box')
            name.classList.add('width-125')


            return name
        },
        type: "html",
        custom_style: ["flex-1-0-5"]
    },

    {
        value: (item) => "Equip",
        onclick: (item) => () => {socket.emit('equip', item.backpack_index)},
        viable: (item) => {
            return true
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },

    {
        value: (item) => "Enchant",
        onclick: (item) => () => {socket.emit('enchant', item.backpack_index)},
        viable: (item) => {
            return true
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },

    {
        value: (item) => "Reroll",
        onclick: (item) => () => {socket.emit('reenchant', item.backpack_index)},
        viable: (item) => {
            return true
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },

    {
        header_text: "Sell",
        value:(item) => "",
        type: "string",
        custom_style: ["flex-0-0-5"],
        onclick:(item) => () => {
            const item_select_div = selectById('create_auction_order_item')
            item_select_div.value = JSON.stringify({index: item.backpack_index})
        },
        viable:(item) => {
            return true
        }
    },

    {
        value: (item) => "Destroy",
        onclick: (item) => () => {socket.emit('destroy', item.backpack_index)},
        viable: (item) => {
            return true
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },

    {
        header_text: "Durability",
        value: (item) => item.durability,
        type: "number",
        custom_style: ["flex-0-0-5"]
    },



    {
        header_background: 'url(/static/img/small_icons/bow.png)',
        value: (item) => item.is_weapon ? item.ranged_damage : 0,
        type: "number",
        custom_style: ["flex-0-0-30px", "centered_background"]
    },
]

const dmg_col: Column<ItemBackpackData> = {
    header_text: "D",
    value: (item) => {
        let total = 0
        for (let d of damage_types) {
            total += item.is_weapon ? item.damage[d] : 0
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
            value: (item) => item.is_weapon ? item.damage[d] : 0,
            type: "number",
            custom_style: ["flex-0-0-30px", "centered_background"]
        }
    )
}

const res_col: Column<ItemBackpackData> = {
    header_text: "R",
    value: (item) => {
        let total = 0
        for (let d of damage_types) {
            total += item.resists[d]
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
            value: (item) => item.resists[d],
            type: "number",
            custom_style: ["flex-0-0-30px", "centered_background"]
        }
    )
}

export function create_backpack_list(container: HTMLElement) {
    const backpack_list = new List<ItemBackpackData>(container)
    backpack_list.columns = columns
    return backpack_list
}

export function create_backpack_list_mini(container: HTMLElement) {
    const backpack_list = new List<ItemBackpackData>(container)
    backpack_list.columns = columns_mini
    return backpack_list
}