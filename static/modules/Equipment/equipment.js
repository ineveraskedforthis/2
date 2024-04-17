import { EquipSlotStorage } from "../.././content.js";
import { List } from "../../widgets/List/list.js";
import { damage_types } from "../Constants/inventory.js";
import { elementById } from "../HTMLwrappers/common.js";
import { socket } from "../Socket/socket.js";
import { generate_item_name } from "../StringGeneration/string_generation.js";
function send_switch_weapon_request(socket) {
    console.log("send switch weapon request");
    socket.emit('switch-weapon');
}
const columns = [
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
        onclick: (item) => () => { socket.emit('unequip', item.equip_slot); },
        viable: (item) => {
            return true;
        },
        type: "string",
        custom_style: ["flex-0-0-5"]
    },
    {
        header_text: "Name",
        value: (item) => {
            const name = document.createElement('div');
            const name_string = generate_item_name(item.item);
            name.innerHTML = name_string;
            name.classList.add('item_tier_' + Math.min(item.item.affixes, 4));
            name.classList.add('centered-box');
            name.classList.add('width-125');
            return name;
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
];
columns.push({
    header_text: "Dmg:",
    value: (item) => {
        let total = 0;
        for (let d of damage_types) {
            total += item.item.is_weapon ? item.item.damage[d] : 0;
        }
        return total;
    },
    type: "number",
    custom_style: ["flex-0-0-5"]
});
for (let d of damage_types) {
    columns.push({
        header_background: 'url(/static/img/small_icons/' + d + '.png)',
        value: (item) => item.item.is_weapon ? item.item.damage[d] : 0,
        type: "number",
        custom_style: ["flex-0-0-30px", "centered_background"]
    });
}
columns.push({
    header_text: "Res:",
    value: (item) => {
        let total = 0;
        for (let d of damage_types) {
            total += item.item.resists[d];
        }
        return total;
    },
    type: "number",
    custom_style: ["flex-0-0-5"]
});
for (let d of damage_types) {
    columns.push({
        header_background: 'url(/static/img/small_icons/' + d + '.png)',
        value: (item) => item.item.resists[d],
        type: "number",
        custom_style: ["flex-0-0-30px", "centered_background"]
    });
}
export function init_equipment_screen(socket) {
    const equip_list = new List(elementById('equip'));
    equip_list.columns = columns;
    elementById('send_switch_weapon_request').onclick = () => send_switch_weapon_request(socket);
    return equip_list;
}

