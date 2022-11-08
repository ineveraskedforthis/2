import { socket } from "../globals.js";
function send_equip_weapon_message(index) {
    const enchant = document.getElementById('enchant');
    let value = enchant.checked;
    if (value) {
        socket.emit('enchant-weapon', index);
    }
    else {
        socket.emit('equip', index);
    }
}
const damage_types = ['fire', 'slice', 'pierce', 'blunt'];
export function generate_name(item) {
    console.log(item.name);
    let name_string = item.name;
    for (let aff of item.affixes_list) {
        if (aff.tag.startsWith('of')) {
            name_string = name_string + ' ' + aff.tag;
        }
        else {
            name_string = aff.tag + ' ' + name_string;
        }
    }
    return name_string;
}
export function generate_item_backpack_div(item) {
    const div = document.createElement('div');
    {
        const name = document.createElement('div');
        const name_string = generate_name(item);
        name.innerHTML = name_string;
        name.classList.add('item_tier_' + Math.min(item.affixes, 4));
        name.classList.add('item_label');
        name.classList.add('width-200');
        div.appendChild(name);
    }
    {
        const damage = document.createElement('div');
        for (let d of damage_types) {
            const d_t = document.createElement('div');
            if (item.is_weapon) {
                d_t.innerHTML = item.damage[d].toString();
            }
            else {
                d_t.innerHTML = item.resists[d].toString();
            }
            d_t.classList.add('width-25');
            d_t.classList.add('align-right');
            damage.appendChild(d_t);
        }
        damage.classList.add('row');
        damage.classList.add('width-100');
        div.appendChild(damage);
    }
    if (item.backpack_index != undefined) {
        ((index) => div.onclick = () => send_equip_weapon_message(index))(item.backpack_index);
    }
    div.classList.add('row');
    return div;
}
export function generate_dummy_item_backpack_div() {
    const div = document.createElement('div');
    {
        const name = document.createElement('div');
        name.innerHTML = 'Item name';
        name.classList.add('item_label');
        name.classList.add('width-200');
        div.appendChild(name);
    }
    {
        const damage = document.createElement('div');
        for (let d of damage_types) {
            const d_t = document.createElement('div');
            d_t.style.backgroundImage = 'url(/static/img/small_icons/' + d + '.png)';
            d_t.classList.add('width-25');
            d_t.classList.add('align-right');
            damage.appendChild(d_t);
        }
        damage.classList.add('row');
        damage.classList.add('width-100');
        div.appendChild(damage);
    }
    div.classList.add('row');
    div.classList.add('height-25');
    return div;
}
export function generate_item_market_div(item) {
    const div = document.createElement('div');
    if (item.seller != undefined) {
        const seller = document.createElement('div');
        seller.innerHTML = item.seller;
        div.appendChild(seller);
    }
    if (item.price != undefined) {
        const price = document.createElement('div');
        price.innerHTML = item.price.toString();
        div.appendChild(price);
    }
    div.appendChild(generate_item_backpack_div(item));
}
