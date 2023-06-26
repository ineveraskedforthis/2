import { socket } from './modules/globals.js';
import { stash_id_to_tag } from "./bulk_tags.js";

const craft_list_div = document.getElementById('craft_list');
let craft_items = [];
let craft_bulk = [];
function construct_craft_inputs(inputs) {
    const inputs_div = document.createElement('div');
    for (let input of inputs) {
        const input_div = document.createElement('div');
        input_div.classList.add(... ['goods_icon', 'small_square']);
        input_div.style.backgroundImage = `url(/static/img/stash_${stash_id_to_tag[input.material]}.png`;
        input_div.innerHTML = input.amount;
        inputs_div.appendChild(input_div);
    }
    return inputs_div;
}

function new_craft_option(id) {
    let div = document.getElementById('c_' + id);
    if (!((div == null)||(div == undefined))) {
        return undefined;
    }

    let craft_div = document.createElement('div');
    craft_div.id = 'c_' + id;
    craft_div.classList.add('craft_option');
    craft_div.classList.add('border-red-thin')
    
    let craft_div_wrapper = document.createElement('div')
    craft_div_wrapper.appendChild(craft_div)

    craft_list_div.appendChild(craft_div_wrapper);

    return craft_div
}

function construct_craft_div(data) {
    craft_bulk.push(data.id);
    let craft_div = new_craft_option(data.id)
    if (craft_div == undefined) return

    craft_div.appendChild(construct_craft_inputs(data.input));

    const outputs_div = document.createElement('div');
    for (let output of data.output) {
        const output_div = document.createElement('div');
        output_div.classList.add('material_id' + output.material);
        output_div.classList.add(... ['goods_icon', 'small_square']);
        output_div.style = `background: no-repeat left/contain url(/static/img/stash_${stash_id_to_tag[output.material]}.png);`;
        outputs_div.appendChild(output_div);
    }
    craft_div.appendChild(outputs_div);

    ((tag) => (craft_div.onclick = () => {
        socket.emit('craft', tag);
        console.log('emit craft' + tag);
    }))(data.id);
}
function construct_craft_item_div(data) {
    let div = document.getElementById('c_' + data.id);
    if ((div == null) || (div == undefined)) {
        craft_items.push(data.id);
        var craft_div = new_craft_option(data.id)
        craft_div.appendChild(construct_craft_inputs(data.input));
        const output_div = document.createElement('div');

        output_div.innerHTML = data.output.model_tag;

        craft_div.appendChild(output_div);
        const durability = document.createElement('div');
        durability.classList.add('durability');
        craft_div.appendChild(durability);

        ((tag) => (craft_div.onclick = () => {
            socket.emit('craft', tag);
            console.log('emit craft' + tag);
        }))(data.id);
    }
}
function update_craft_div(message) {
    let div = document.getElementById('c_' + message.tag);
    if (div == null) {
        return;
    }

    for (let item of message.value) {
        const div_output = div.querySelector('.material_id' + item.material);
        div_output.innerHTML = item.amount;
    }
}
function update_craft_item_div(message) {
    let div = document.getElementById('c_' + message.tag);
    if (div == null) {
        return;
    }

    const div_output = div.querySelector('.durability');
    if (div_output.innerHTML != message.value){
        div_output.innerHTML = message.value;
    }
}
document.getElementById("craft-tag-item").onclick = () => {
    for (let tag of craft_items) {
        let div = document.getElementById('c_' + tag);
        div.parentElement.classList.toggle('hidden');
    }
    document.getElementById("craft-tag-item").classList.toggle('highlight');
};
document.getElementById("craft-tag-bulk").onclick = () => {
    for (let tag of craft_bulk) {
        let div = document.getElementById('c_' + tag);
        div.parentElement.classList.toggle('hidden');
    }
    document.getElementById("craft-tag-bulk").classList.toggle('highlight');
};
// function update_craft_probability(data) {
//     console.log(data)
//     let div = document.getElementById(data.tag + '_chance')
//     if (div == undefined) {
//         console.log('craft does not exist????')
//         return
//     }
//     div.innerHTML = Math.floor(data.value)
// }
// socket.on('craft-probability', msg => update_craft_probability(msg))
socket.on('craft-bulk', (msg) => { update_craft_div(msg); });
socket.on('craft-bulk-complete', (msg) => { construct_craft_div(msg.value); });
socket.on('craft-item', (msg) => { update_craft_item_div(msg); });
socket.on('craft-item-complete', (msg) => { construct_craft_item_div(msg.value); });
