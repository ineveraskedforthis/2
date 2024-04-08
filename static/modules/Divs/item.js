import { socket } from "../Socket/socket.js";
function send_equip_weapon_message(index) {
    {
        const destroy = document.getElementById('destroy');
        let value_destroy = destroy.checked;
        if (value_destroy) {
            socket.emit('destroy', index);
            return;
        }
    }
    {
        const enchant = document.getElementById('enchant');
        let value = enchant.checked;
        if (value) {
            socket.emit('enchant', index);
            return;
        }
    }
    {
        const reenchant = document.getElementById('reenchant');
        let value = reenchant.checked;
        if (value) {
            socket.emit('reenchant', index);
            return;
        }
    }
    {
        const fill_market = document.getElementById('fill_market');
        let value = fill_market.checked;
        if (value) {
            const item_select_div = document.getElementById('create_auction_order_item');
            item_select_div.value = JSON.stringify({ index: index });
            return;
        }
    }
    socket.emit('equip', index);
}
export function generate_item_backpack_div(item, index) {
    const div = document.createElement('div');
    if (index != undefined) {
        ((index) => div.onclick = () => send_equip_weapon_message(index))(index);
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
        name.classList.add('width-125');
        div.appendChild(name);
    }
    div.classList.add('row');
    div.classList.add('height-25');
    return div;
}
export function generate_item_market_div(item) {
    const div = document.createElement('div');
    {
        const seller = document.createElement('div');
        seller.innerHTML = item.seller;
        seller.classList.add('width-100');
        div.appendChild(seller);
    }
    {
        const price = document.createElement('div');
        price.innerHTML = item.price.toString();
        price.classList.add('width-100');
        div.appendChild(price);
    }
    div.appendChild(generate_item_backpack_div(item, undefined));
    div.classList.add('row');
    div.classList.add('item');
    // console.log(div)
    return div;
}
export function generate_market_header() {
    const div = document.createElement('div');
    {
        const seller = document.createElement('div');
        seller.innerHTML = 'Seller';
        seller.classList.add('width-100');
        div.appendChild(seller);
    }
    {
        const price = document.createElement('div');
        price.innerHTML = 'Price';
        price.classList.add('width-100');
        div.appendChild(price);
    }
    div.appendChild(generate_dummy_item_backpack_div());
    div.classList.add('row');
    return div;
}
