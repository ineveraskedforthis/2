import { damage_type, ItemData, ItemOrderData } from "../../../shared/inventory"
import { socket } from "../Socket/socket.js";
import { generate_item_name } from "../StringGeneration/string_generation";

function send_equip_weapon_message(index:number) {
    {
        const destroy = document.getElementById('destroy') as HTMLInputElement
        let value_destroy = destroy.checked
        if (value_destroy) {
            socket.emit('destroy', index);
            return
        }
    }

    {
        const enchant = document.getElementById('enchant') as HTMLInputElement
        let value = enchant.checked
        if (value) {
            socket.emit('enchant', index);
            return
        }
    }

    {
        const reenchant = document.getElementById('reenchant') as HTMLInputElement
        let value = reenchant.checked
        if (value) {
            socket.emit('reenchant', index);
            return
        }
    }

    {
        const fill_market = document.getElementById('fill_market') as HTMLInputElement
        let value = fill_market.checked
        if (value) {
            const item_select_div = document.getElementById('create_auction_order_item') as HTMLSelectElement
            item_select_div.value = JSON.stringify({index: index})
            return
        }
    }


    socket.emit('equip', index);
}



export function generate_item_backpack_div(item: ItemData, index: number|undefined) {
    const div = document.createElement('div')

    if (index != undefined) {
        ((index: number) =>
            div.onclick = () => send_equip_weapon_message(index)
        )(index)
    }

    div.classList.add('row')
    return div
}

export function generate_dummy_item_backpack_div() {
    const div = document.createElement('div')
    {
        const name = document.createElement('div')

        name.innerHTML = 'Item name'

        name.classList.add('item_label')
        name.classList.add('width-125')
        div.appendChild(name)
    }

    div.classList.add('row')
    div.classList.add('height-25')
    return div
}

export function generate_item_market_div (item: ItemOrderData) {
    const div = document.createElement('div')
    {
        const seller = document.createElement('div')
        seller.innerHTML = item.seller
        seller.classList.add('width-100')
        div.appendChild(seller)
    }

    {
        const price = document.createElement('div')
        price.innerHTML = item.price.toString()
        price.classList.add('width-100')
        div.appendChild(price)
    }
    div.appendChild(generate_item_backpack_div(item, undefined))
    div.classList.add('row')
    div.classList.add('item')

    // console.log(div)
    return div
}

export function generate_market_header () {
        const div = document.createElement('div')
    {
        const seller = document.createElement('div')
        seller.innerHTML = 'Seller'
        seller.classList.add('width-100')
        div.appendChild(seller)
    }

    {
        const price = document.createElement('div')
        price.innerHTML = 'Price'
        price.classList.add('width-100')
        div.appendChild(price)
    }

    div.appendChild(generate_dummy_item_backpack_div())

    div.classList.add('row')

    return div
}

