import { socket } from './modules/globals.js';
export var stash_tag_to_id = {};
export var stash_id_to_tag = {};
export function update_tags(msg) {
    console.log("TAAAAAAGS");
    console.log(msg);
    let inventory_div = document.getElementById('goods_stash');
    let material_select = document.getElementById('create_order_material');
    inventory_div.innerHTML = '';
    material_select.innerHTML = '';
    stash_tag_to_id = msg;
    console.log(stash_tag_to_id);
    for (let tag of Object.keys(msg)) {
        stash_tag_to_id[tag] = msg[tag];
        stash_id_to_tag[msg[tag]] = tag;
    }
    for (var tag in msg) {
        {
            // stash
            let div_cell = document.createElement('div');
            div_cell.classList.add('goods_type_stash');
            div_cell.classList.add('tooltip');
            div_cell.classList.add(tag);
            ((div_cell) => div_cell.addEventListener("animationend", (event) => {
                div_cell.classList.remove('stash_up');
                div_cell.classList.remove('stash_down');
            }, false))(div_cell);
            ((tag) => div_cell.onclick = () => { process_stash_click(tag); })(tag);
            {
                let div_image = document.createElement('div');
                div_image.classList.add(...['goods_icon', 'fill_container']);
                div_image.style.backgroundImage = `url(/static/img/stash_${tag}.png)`;
                div_cell.appendChild(div_image);
            }
            {
                let div_text = document.createElement('span');
                div_text.innerHTML = tag;
                div_text.classList.add('tooltiptext');
                div_cell.appendChild(div_text);
            }
            {
                let div = document.createElement('div');
                div.innerHTML = '?';
                div.classList.add('goods_amount_in_inventory');
                div_cell.appendChild(div);
            }
            inventory_div.appendChild(div_cell);
            let option = document.createElement('option');
            option.value = msg[tag].toString();
            option.innerHTML = tag;
            material_select.appendChild(option);
        }
    }
    socket.on('savings', msg => update_savings(msg));
    socket.on('savings-trade', msg => update_savings_trade(msg));
    socket.on('stash-update', msg => { console.log('stash-update'); update_stash(msg); });
}
export function update_savings(msg) {
    document.getElementById('savings').innerHTML = 'Money: ' + msg;
}
export function update_savings_trade(msg) {
    document.getElementById('savings_trade').innerHTML = 'Money reserved in trade: ' + msg;
}
export function update_stash(data) {
    console.log("STAAAAASH");
    console.log(data);
    for (let tag in stash_id_to_tag) {
        let stash = document.getElementById('goods_stash');
        // console.log(tag, stash_id_to_tag[tag])
        let background_div = stash.querySelector('.' + stash_id_to_tag[tag]);
        if (background_div == null)
            continue;
        let div = background_div.querySelector('.goods_amount_in_inventory');
        if (div != null) {
            let current = Number(div.innerHTML);
            if (current > data[tag]) {
                background_div.classList.remove('stash_up');
                background_div.classList.remove('stash_down');
                background_div.classList.add('stash_down');
                div.innerHTML = (data[tag] || 0).toString();
            }
            else if (current < data[tag]) {
                background_div.classList.remove('stash_up');
                background_div.classList.remove('stash_down');
                background_div.classList.add('stash_up');
                div.innerHTML = (data[tag] || 0).toString();
            }
            else if (isNaN(current)) {
                div.innerHTML = (data[tag] || 0).toString();
            }
        }
    }
}
export function process_stash_click(tag) {
    console.log(tag);
    if (tag == 'food') {
        socket.emit('eat');
    }
}
