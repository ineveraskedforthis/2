import { ItemData, ItemOrderData } from "../../../shared/inventory.js";
import { Column, List } from "../../widgets/List/list.js";
import { damage_types } from "../Constants/inventory.js";
import { generate_item_market_div, generate_market_header } from "../Divs/item.js";
import { elementById, selectOne } from "../HTMLwrappers/common.js";
import { socket } from "../Socket/socket.js";
import { generate_item_name } from "../StringGeneration/string_generation.js";
import { globals } from "../globals.js";

const columns:Column<ItemOrderData>[] = [
    {
        header_text: "Owner name",
        value: (item) => item.seller,
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
            name.classList.add('item_label')
            name.classList.add('width-125')

            return name
        },
        type: "html",
        custom_style: ["flex-1-0-5"]
    },

    {
        header_text: "Price",
        value: (item) => item.price,
        type: "number",
        custom_style: ["flex-0-0-5"]
    },

    {
        value: (item) => "buyout",
        onclick: (item) => () => {socket.emit('buyout', {char_id: item.seller_id, item_id: item.id})},
        viable: (item) => {
            const character = globals.character_data
            if (character == undefined) return false
            return (1 * item.price <= character.savings.value)
        },
        type: "string",
        custom_style: ["flex-1-0-5"]
    },

    {
        header_text: "Durability",
        value: (item) => item.durability,
        type: "number",
        custom_style: ["flex-0-0-5"]
    },

    {
        header_text: "Item type",
        value: (item) => item.item_type,
        type: "string",
        custom_style: ["flex-1-0-5"]
    },

    {
        header_background: 'url(/static/img/small_icons/bow.png)',
        value: (item) => item.is_weapon ? item.ranged_damage : 0,
        type: "number",
        custom_style: ["flex-0-0-30px", "centered_background"]
    },
]

columns.push({
    header_text: "Dmg:",
    value: (item) => {
        let total = 0
        for (let d of damage_types) {
            total += item.is_weapon ? item.damage[d] : 0
        }
        return total
    },
    type: "number",
    custom_style: ["flex-0-0-5"]
})


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

columns.push({
    header_text: "Res:",
    value: (item) => {
        let total = 0
        for (let d of damage_types) {
            total += item.resists[d]
        }
        return total
    },
    type: "number",
    custom_style: ["flex-0-0-5"]
})

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

const item_market_container = elementById('auction_house_tab')
export const market_items = new List<ItemOrderData>(item_market_container)
market_items.columns = columns

export function init_market_items() {
    socket.on('item-market-data', data => {update_item_market(data)});
}

export function update_item_market(data: ItemOrderData[]) {
    console.log("updating market")
    console.log(data)

    market_items.data = data
}