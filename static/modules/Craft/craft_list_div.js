import { socket } from "../Socket/socket.js";
import { stash_id_to_tag } from '../Stash/stash.js';
import { elementById, elementParent, existsById, selectOneFrom } from '../HTMLwrappers/common.js';
var craft_items = [];
var craft_bulk = [];
const craft_list_div = elementById('craft_list');
export function init_craft_table() {
    let craft_items_box = elementById("craft-tag-item");
    let craft_bulk_box = elementById("craft-tag-bulk");
    craft_items_box.onclick = () => {
        for (let tag of craft_items) {
            let div = elementById('c_' + tag);
            elementParent(div).classList.toggle('hidden');
        }
        craft_items_box.classList.toggle('highlight');
    };
    craft_bulk_box.onclick = () => {
        for (let tag of craft_bulk) {
            let div = elementById('c_' + tag);
            elementParent(div).classList.toggle('hidden');
        }
        craft_bulk_box.classList.toggle('highlight');
    };
    socket.on('craft-bulk', (msg) => { update_craft_div(msg); });
    socket.on('craft-bulk-complete', (msg) => { construct_craft_div(msg.value); });
    socket.on('craft-item', (msg) => { update_craft_item_div(msg); });
    socket.on('craft-item-complete', (msg) => { construct_craft_item_div(msg.value); });
}
function construct_craft_inputs(inputs) {
    const inputs_div = document.createElement('div');
    for (let input of inputs) {
        const input_div = document.createElement('div');
        input_div.classList.add(...['goods-icon', 'small-square']);
        input_div.style.backgroundImage = `url(/static/img/stash_${stash_id_to_tag[input.material]}.png`;
        input_div.innerHTML = input.amount.toString();
        inputs_div.appendChild(input_div);
    }
    return inputs_div;
}
function new_craft_option(id) {
    if (existsById("c_" + id)) {
        return undefined;
    }
    let craft_div = document.createElement('div');
    craft_div.id = 'c_' + id;
    craft_div.classList.add('craft_option');
    craft_div.classList.add('border-red-thin');
    let craft_div_wrapper = document.createElement('div');
    craft_div_wrapper.appendChild(craft_div);
    craft_list_div.appendChild(craft_div_wrapper);
    return craft_div;
}
function construct_craft_div(data) {
    craft_bulk.push(data.id);
    let craft_div = new_craft_option(data.id);
    if (craft_div == undefined)
        return;
    craft_div.appendChild(construct_craft_inputs(data.input));
    const outputs_div = document.createElement('div');
    for (let output of data.output) {
        const output_div = document.createElement('div');
        output_div.classList.add('material_id' + output.material);
        output_div.classList.add(...['goods-icon', 'small-square']);
        output_div.style.background = `no-repeat left/contain url(/static/img/stash_${stash_id_to_tag[output.material]}.png)`;
        outputs_div.appendChild(output_div);
    }
    craft_div.appendChild(outputs_div);
    ((tag) => (craft_div.onclick = () => {
        socket.emit('craft', tag);
        console.log('emit craft' + tag);
    }))(data.id);
}
function construct_craft_item_div(data) {
    var craft_div = new_craft_option(data.id);
    if (craft_div == undefined)
        return;
    craft_items.push(data.id);
    craft_div.appendChild(construct_craft_inputs(data.input));
    const output_div = document.createElement('div');
    output_div.innerHTML = data.output_model;
    craft_div.appendChild(output_div);
    const durability = document.createElement('div');
    durability.classList.add('durability');
    craft_div.appendChild(durability);
    ((tag) => (craft_div.onclick = () => {
        socket.emit('craft', tag);
        console.log('emit craft' + tag);
    }))(data.id);
}
function update_craft_div(message) {
    if (!existsById('c_' + message.tag)) {
        return;
    }
    for (let item of message.value) {
        const div_output = selectOneFrom(elementById('c_' + message.tag), '.material_id' + item.material);
        div_output.innerHTML = item.amount.toString();
    }
}
function update_craft_item_div(message) {
    if (!existsById('c_' + message.tag)) {
        return;
    }
    const div_output = selectOneFrom(elementById('c_' + message.tag), '.durability');
    if (div_output.innerHTML != message.value.toString()) {
        div_output.innerHTML = message.value.toString();
    }
}
