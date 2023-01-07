import { socket } from './modules/globals.js';
import { stash_id_to_tag } from './bulk_tags.js';

{
    let button = document.getElementById('clear_orders_button');
    button.onclick = () => socket.emit('clear-orders');
}
{
    let button = document.getElementById('clear_auction_orders_button');
    button.onclick = () => socket.emit('clear-item-orders');
}
let market_div = document.querySelector('.goods_list');
function send_execute_order_request(order_id, amount) {
    socket.emit('execute-order', { amount: amount, order: order_id });
}
function create_market_order_row(good_tag, amount, sell_price, buy_price, dummy_flag, order_id) {
    let div_cell = document.createElement('div');
    div_cell.classList.add('goods_type');


    if (!dummy_flag) {
        div_cell.classList.add(good_tag);
        {
            let div_image = document.createElement('div');
            div_image.classList.add('goods_icon');
            div_image.style = "background: no-repeat left/contain url(/static/img/stash_" + good_tag + ".png);";
            div_cell.appendChild(div_image);
        }
    }


    {
        let div_text = document.createElement('div');
        div_text.innerHTML = good_tag;
        div_text.classList.add('goods_name');
        div_cell.appendChild(div_text);
    }

    {
        let avg_price = document.createElement('div');
        avg_price.innerHTML = buy_price;
        avg_price.classList.add('goods_avg_buy_price');
        div_cell.appendChild(avg_price);
    }

    {
        let avg_price = document.createElement('div');
        avg_price.innerHTML = sell_price;
        avg_price.classList.add('goods_avg_sell_price');
        div_cell.appendChild(avg_price);
    }

    {
        let div = document.createElement('div');
        div.innerHTML = amount;
        div.classList.add('goods_amount_in_inventory');
        div_cell.appendChild(div);
    }

    if (!dummy_flag) {
        {
            let div = document.createElement('div');
            div.innerHTML = 'Buy/Sell 1';
            div.classList.add('market_button');
            div_cell.appendChild(div);

            ((order_id, button) => button.onclick = () => send_execute_order_request(order_id, 1))(order_id, div);
        }

        {
            let div = document.createElement('div');
            div.innerHTML = 'Buy/Sell 10';
            div.classList.add('market_button');
            div_cell.appendChild(div);

            ((order_id, button) => button.onclick = () => send_execute_order_request(order_id, 10))(order_id, div);
        }

        {
            let div = document.createElement('div');
            div.innerHTML = 'Buy/Sell 50';
            div.classList.add('market_button');
            div_cell.appendChild(div);

            ((order_id, button) => button.onclick = () => send_execute_order_request(order_id, 50))(order_id, div);
        }

        {
            let div = document.createElement('div');
            div.innerHTML = 'Remove';
            div.classList.add('market_button');
            div_cell.appendChild(div);

            ((order_id, button) => button.onclick = () => socket.emit('clear-order', order_id))(order_id, div);
        }
    }



    // ((good_tag) => div_cell.onclick = () => {
    //     goods_market.select(good_tag)
    // })(good_tag)
    market_div.appendChild(div_cell);
}
export function update_market(data) {
    console.log('update market');
    // console.log(data)
    market_div.innerHTML = '';

    create_market_order_row('Item type', 'Amount', 'Sell price', 'Buy_price', true);

    for (let item of data) {
        // console.log(item)
        let sell_price = '?';
        let buy_price = '?';
        if (item.typ == 'sell') { sell_price = item.price; }
        if (item.typ == 'buy') { buy_price = item.price; }
        let tag = stash_id_to_tag[item.tag];
        create_market_order_row(tag, item.amount, sell_price, buy_price, false, item.id);
    }
}


{
    let order_button = document.getElementById('create_order_button')
    order_button.onclick = (() => {
        let material = document.getElementById('create_order_material').value
        let type = document.getElementById('create_order_type').value
        let amount = document.getElementById('create_order_amount').value
        let price = document.getElementById('create_order_price').value

        socket.emit(type, {material: Number(material), amount: Number(amount), price: Number(price)})
        // console.log(material, type, amount, price)
    })
}

{
    let order_button = document.getElementById('create_auction_order_button')
    order_button.onclick = (() => {
        let item = JSON.parse(document.getElementById('create_auction_order_item').value)
        let price = document.getElementById('create_auction_order_price').value

        socket.emit('sell-item', {index: Number(item.index), item_type: item.type, price: Number(price)})
        // console.log(material, type, amount, price)
    })
}