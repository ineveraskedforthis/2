import { damage_type, ItemData, ItemOrderData } from "../../../shared/inventory"
import { socket } from "../Socket/socket.js";

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

const damage_types: damage_type[] = ['fire', 'slice', 'pierce', 'blunt']

export function generate_name(item: ItemData) {
    // console.log(item.name)
    let name_string = item.name
    for (let aff of item.affixes_list) {
        if (aff.tag.startsWith('of')) {
            name_string = name_string + ' ' + aff.tag
        } else {
            name_string = aff.tag + ' ' + name_string
        }
    }
    return name_string
}

export function generate_item_backpack_div(item: ItemData, index: number|undefined) {
    const div = document.createElement('div')
    {
        const name = document.createElement('div')

        const name_string = generate_name(item)

        name.innerHTML = name_string
        name.classList.add('item_tier_' + Math.min(item.affixes, 4))
        name.classList.add('item_label')
        name.classList.add('width-125')
        div.appendChild(name)
    }

    {
        const damage = document.createElement('div')

        for (let d of damage_types) {
            const d_t = document.createElement('div')
            if (item.is_weapon) {
                d_t.innerHTML = item.damage[d].toString()
            } else {
                d_t.innerHTML = item.resists[d].toString()
            }
            d_t.classList.add('width-25')
            d_t.classList.add('align-right')
            damage.appendChild(d_t)
        }

        {
            const d_t = document.createElement('div')
            if (item.is_weapon) {
                d_t.innerHTML = item.ranged_damage.toString()
            } else {
                d_t.innerHTML = '0'
            }
            d_t.classList.add('width-25')
            d_t.classList.add('align-right')
            damage.appendChild(d_t)
        }

        damage.classList.add('row')
        damage.classList.add('width-auto')
        div.appendChild(damage)
    }

    {
        const durability = document.createElement('div')
        durability.innerHTML = item.durability.toString()
        durability.classList.add('width-50')
        durability.classList.add('align-right')

        div.appendChild(durability)
    }

    {
        const equip_slot = document.createElement('div')
        equip_slot.innerHTML = item.item_type
        equip_slot.classList.add('width-100')
        equip_slot.classList.add('align-right')
        div.appendChild(equip_slot)
    }

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

    {
        const damage = document.createElement('div')
        for (let d of damage_types) {
            const d_t = document.createElement('div')
            d_t.style.backgroundImage = 'url(/static/img/small_icons/'+ d + '.png)'
            d_t.classList.add('width-25')
            d_t.classList.add('align-right')
            damage.appendChild(d_t)
        }

        {
            const d_t = document.createElement('div')
            d_t.style.backgroundImage = 'url(/static/img/small_icons/bow.png)'
            d_t.classList.add('width-25')
            d_t.classList.add('align-right')
            damage.appendChild(d_t)
        }

        damage.classList.add('row')
        damage.classList.add('width-auto')
        div.appendChild(damage)
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

