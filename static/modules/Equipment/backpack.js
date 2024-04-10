import { List } from "../../widgets/List/list.js";
import { damage_types } from "../Constants/inventory.js";
import { elementById, selectById } from "../HTMLwrappers/common.js";
import { socket } from "../Socket/socket.js";
import { generate_item_name } from "../StringGeneration/string_generation.js";
const columns = [
    {
        header_text: "Item type",
        value: (item) => item.item_type,
        type: "string",
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Name",
        value: (item) => {
            const name = document.createElement('div');
            const name_string = generate_item_name(item);
            name.innerHTML = name_string;
            name.classList.add('item_tier_' + Math.min(item.affixes, 4));
            name.classList.add('centered-box');
            name.classList.add('width-125');
            return name;
        },
        type: "html",
        custom_style: ["flex-1-0-5"]
    },
    {
        value: (item) => "Equip",
        onclick: (item) => () => { socket.emit('equip', item.backpack_index); },
        viable: (item) => {
            return true;
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },
    {
        value: (item) => "Enchant",
        onclick: (item) => () => { socket.emit('enchant', item.backpack_index); },
        viable: (item) => {
            return true;
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },
    {
        value: (item) => "Reroll",
        onclick: (item) => () => { socket.emit('reenchant', item.backpack_index); },
        viable: (item) => {
            return true;
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },
    {
        header_text: "Sell",
        value: (item) => "",
        type: "string",
        custom_style: ["flex-0-0-5"],
        onclick: (item) => () => {
            const item_select_div = selectById('create_auction_order_item');
            item_select_div.value = JSON.stringify({ index: item.backpack_index });
        },
        viable: (item) => {
            return true;
        }
    },
    {
        value: (item) => "Destroy",
        onclick: (item) => () => { socket.emit('destroy', item.backpack_index); },
        viable: (item) => {
            return true;
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
];
columns.push({
    header_text: "Dmg:",
    value: (item) => {
        let total = 0;
        for (let d of damage_types) {
            total += item.is_weapon ? item.damage[d] : 0;
        }
        return total;
    },
    type: "number",
    custom_style: ["flex-0-0-5"]
});
for (let d of damage_types) {
    columns.push({
        header_background: 'url(/static/img/small_icons/' + d + '.png)',
        value: (item) => item.is_weapon ? item.damage[d] : 0,
        type: "number",
        custom_style: ["flex-0-0-30px", "centered_background"]
    });
}
columns.push({
    header_text: "Res:",
    value: (item) => {
        let total = 0;
        for (let d of damage_types) {
            total += item.resists[d];
        }
        return total;
    },
    type: "number",
    custom_style: ["flex-0-0-5"]
});
for (let d of damage_types) {
    columns.push({
        header_background: 'url(/static/img/small_icons/' + d + '.png)',
        value: (item) => item.resists[d],
        type: "number",
        custom_style: ["flex-0-0-30px", "centered_background"]
    });
}
export const backpack_list = new List(elementById('backpack_tab'));
backpack_list.columns = columns;
