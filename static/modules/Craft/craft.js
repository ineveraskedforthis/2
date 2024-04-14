import { div } from "../../widgets/Div/custom_div.js";
import { List } from "../../widgets/List/list.js";
import { elementById } from "../HTMLwrappers/common.js";
import { socket } from "../Socket/socket.js";
import { stash_id_to_tag } from "../Stash/stash.js";
import { BulkAmount, Value, value_class_name } from "../Values/collection.js";
import { ArmourStorage, WeaponStorage } from "../.././content.js";
const durability_data = {};
const output_amount_data = {};
const inputs_amount_data = {};
function item_amount_view_diw(items) {
    const div = document.createElement('div');
    div.classList.add("columns_container");
    for (let item of items) {
        const item_div = document.createElement('div');
        item_div.classList.add(...['goods-icon', 'small-square', value_class_name(item.id)]);
        item_div.style.backgroundImage = `url(/static/img/stash_${stash_id_to_tag[item.material_index]}.png`;
        item_div.innerHTML = item.value.toString();
        div.appendChild(item_div);
    }
    return div;
}
function is_item_craft(x) {
    return "output_affixes" in x;
}
function is_bulk_craft(x) {
    return "output" in x;
}
const craft_columns = [
    {
        header_text: "Inputs",
        type: "html",
        value: (item) => {
            return item_amount_view_diw(inputs_amount_data[item.id]);
        },
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Output",
        type: "html",
        value: (item) => {
            if (is_item_craft(item)) {
                if (item.output.tag == "weapon") {
                    return div(undefined, WeaponStorage.get(item.output.value).id_string, ["centered-box"], undefined, undefined, []);
                }
                else {
                    return div(undefined, ArmourStorage.get(item.output.value).id_string, ["centered-box"], undefined, undefined, []);
                }
            }
            if (is_bulk_craft(item)) {
                return item_amount_view_diw(output_amount_data[item.id]);
            }
            return div(undefined, "???", [], undefined, undefined, []);
        },
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Durability",
        type: "number",
        value: (item) => {
            if (is_item_craft(item)) {
                return durability_data[item.id].value ? durability_data[item.id].value : 0;
            }
            if (is_bulk_craft(item)) {
                return 0;
            }
            return 0;
        },
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Craft",
        type: "string",
        value: (item) => "",
        onclick(item) {
            return () => {
                socket.emit('craft', item.id);
                console.log('emit craft' + item.id);
            };
        },
        viable(item) {
            return true;
        },
        custom_style: ["flex-0-0-5"]
    }
];
export function new_craft_table() {
    const craft_list = new List(elementById('craft_list'));
    craft_list.columns = craft_columns;
    return craft_list;
}
export function update_craft_item_div(craft_list, message) {
    if (durability_data[message.tag] == undefined) {
        durability_data[message.tag] = new Value(socket, message.tag + `_craft_durability`, [craft_list]);
    }
    durability_data[message.tag].value = message.value;
}
export function new_craft_bulk(craft_list, data) {
    if (inputs_amount_data[data.tag] != undefined) {
        return;
    }
    inputs_amount_data[data.tag] = [];
    output_amount_data[data.tag] = [];
    for (let item of data.value.input) {
        let value = new BulkAmount(socket, data.tag + "_craft_input_" + item.material, item.material, []);
        inputs_amount_data[data.tag].push(value);
        value.value = item.amount;
    }
    for (let item of data.value.output) {
        let value = new BulkAmount(socket, data.tag + "_craft_output_" + item.material, item.material, []);
        output_amount_data[data.tag].push(value);
        value.value = item.amount;
    }
    craft_list.data.push(data.value);
    craft_list.update_display();
}
export function new_craft_item(craft_list, data) {
    if (durability_data[data.tag] != undefined) {
        return;
    }
    inputs_amount_data[data.tag] = [];
    for (let item of data.value.input) {
        let value = new BulkAmount(socket, data.tag + "_craft_input_" + item.material, item.material, []);
        inputs_amount_data[data.tag].push(value);
        value.value = item.amount;
    }
    durability_data[data.tag] = new Value(socket, data.tag + "_craft_durability", [craft_list]);
    craft_list.data.push(data.value);
    craft_list.update_display();
}

