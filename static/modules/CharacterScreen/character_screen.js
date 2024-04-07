import { elementById, inputById } from "../HTMLwrappers/common.js";
// export const EQUIPMENT_TAGS = ['weapon', 'secondary', 'body', 'legs', 'foot', 'head', 'arms'];
function send_update_request(socket) {
    socket.emit('char-info-detailed');
}
function send_eat_request(socket) {
    socket.emit('eat');
    socket.emit('char-info-detailed');
}
function send_clean_request(socket) {
    socket.emit('clean');
    socket.emit('char-info-detailed');
}
function send_craft_food_request(socket) {
    socket.emit('char-info-detailed');
}
function send_craft_clothes_request(socket) {
    socket.emit('cclothes');
    socket.emit('char-info-detailed');
}
// function send_enchant_request(socket: Socket) {
//     let items = document.getElementsByName('sell_item');
//     let index = undefined;
//     for(let i = 0; i < items.length; i++) {
//         if (items[i].checked) index = parseInt(items[i].value);
//     }
//     socket.emit('enchant', index)
// }
// function send_disenchant_request(socket: Socket) {
//     let items = document.getElementsByName('sell_item');
//     let index = undefined;
//     for(let i = 0; i < items.length; i++) {
//         if (items[i].checked) index = parseInt(items[i].value);
//     }
//     socket.emit('disenchant', index)
// }
// function get_item_image(tag: string) {
//     return "background: no-repeat center/100% url(/static/img/" + tag + ".png);"
// }
function send_sell_item_request(socket) {
    let items = document.getElementsByName('sell_item');
    let index = undefined;
    for (let i = 0; i < items.length; i++) {
        if (items[i].checked)
            index = parseInt(items[i].value);
    }
    let buyout_price = inputById('buyout_price').value;
    let starting_price = inputById('starting_price').value;
    socket.emit('sell-item', { index: index, buyout_price: buyout_price, starting_price: starting_price });
}
export class CharacterScreen {
    constructor(socket) {
        this.socket = socket;
        const stats_div = elementById('stats');
        const actions_div = elementById('character_screen_actions');
        {
            const button = document.createElement('button');
            button.onclick = () => send_update_request(socket);
            button.innerHTML = 'update';
            actions_div.appendChild(button);
        }
        this.miscellaneous_data_box = document.createElement('misc');
        stats_div.appendChild(this.miscellaneous_data_box);
        {
            const button = document.createElement('button');
            button.onclick = () => send_sell_item_request(socket);
            button.innerHTML = 'sell selected item';
            actions_div.appendChild(button);
        }
        {
            let label = document.createElement('p');
            label.innerHTML = 'starting price';
            actions_div.appendChild(label);
            let form = document.createElement('input');
            form.setAttribute('id', 'starting_price');
            actions_div.appendChild(form);
        }
        {
            let label = document.createElement('p');
            label.innerHTML = 'buyout price';
            actions_div.appendChild(label);
            let form = document.createElement('input');
            form.setAttribute('id', 'buyout_price');
            actions_div.appendChild(form);
        }
    }
    update(data) {
        this.miscellaneous_data_box.innerHTML = '';
        for (let i in data.stats) {
            let stats_line = document.createElement('p');
            stats_line.append(document.createTextNode(`${i}: ${data.stats[i]}`));
            this.miscellaneous_data_box.appendChild(stats_line);
        }
        let resists_label = document.createElement('p');
        resists_label.innerHTML = 'resists';
        this.miscellaneous_data_box.appendChild(resists_label);
        for (let i in data.resists) {
            let other_line = document.createElement('p');
            other_line.append(document.createTextNode(`${i}: ${data.resists[i]}`));
            this.miscellaneous_data_box.appendChild(other_line);
        }
    }
}
