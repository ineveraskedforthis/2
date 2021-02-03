function send_buyout_request() {
    let items = document.getElementsByName('market_item_list_radio');
    let index = undefined;

    for(let i = 0; i < items.length; i++) {
        if(items[i].checked)
            index = parseInt(items[i].value);
        }

    console.log('buyout ' + index)
    socket.emit('buyout', index);
}

class ItemMarketTable {
    constructor(container) {
        this.data = [];
        this.container = container;
        this.table_container = document.createElement('div');
        let table = document.createElement('table');
        this.table_container.appendChild(table)
        this.container.appendChild(this.table_container)

        this.control_container = document.createElement('div');
        {
            let buyout_button = document.createElement('button');
            (() => 
                buyout_button.onclick = () => send_buyout_request()
            )();
            buyout_button.innerHTML = 'buyout';
            this.control_container.appendChild(buyout_button);
        }
        this.container.appendChild(this.control_container);
    }

    add_cell_to_row(row, data) {
        let cell = row.insertCell();
        cell.innerHTML = data;
    }

    update(data) {
        let table = document.createElement('table');
        {
            let row = table.insertRow()
            this.add_cell_to_row(row, 'owner_name');
            this.add_cell_to_row(row, '| item.tag');
            this.add_cell_to_row(row, '| buyout_price');
            this.add_cell_to_row(row, '| current_price');
            this.add_cell_to_row(row, '| time left')
        }
        for (let i of data) {
            let row = table.insertRow()
            this.add_cell_to_row(row, i.owner_name);
            {
                let cell = row.insertCell();
                let item_block = document.createElement('div')
                item_block.setAttribute('class', 'tooltip')
                item_block.innerHTML = i.item.tag
                let span = document.createElement('span')
                span.setAttribute('class', 'tooltiptext');
                span.innerHTML = ''
                for (let j = 0; j < i.item.affixes; j++){
                    let affix = i.item['a' + j];
                    if (affix != undefined){
                        span.innerHTML = affix.tag + ' ' + affix.tier + ' | ';
                    }
                }
                item_block.appendChild(span)
                cell.appendChild(item_block)
            }
            this.add_cell_to_row(row, '| ' + i.buyout_price);
            this.add_cell_to_row(row, '| ' + i.current_price);
            let now = Date.now();
            let dt = (i.end_time - now);
            this.add_cell_to_row(row, '| ' + (Math.floor(dt / 60) / 1000) + ' minutes');
            {
                let cell = row.insertCell();
                let radio_button = document.createElement('input');
                radio_button.setAttribute('type', 'radio');
                radio_button.setAttribute('name', 'market_item_list_radio');
                radio_button.setAttribute('value', i.id);
                cell.appendChild(radio_button);
            }
        }
        this.table_container.innerHTML = '';
        this.table_container.appendChild(table);
    }
}

export class GoodsMarket {
    constructor(container, socket) {
        this.container = container;
        this.buy_amount_div = container.querySelector('#buy_amount > .current')
        this.sell_amount_div = container.querySelector('#sell_amount > .current')
        this.sell_amount = 0;
        this.buy_amount = 0;
        {
            let button = container.querySelector('#sell_amount > .plus')
            button.onclick = (event) => {
                event.preventDefault();
                this.inc_sell()
            }
        }

        {
            let button = container.querySelector('#sell_amount > .minus')
            button.onclick = (event) => {
                event.preventDefault();
                this.dec_sell()
            }
        }

        {
            let button = container.querySelector('#buy_amount > .plus')
            button.onclick = (event) => {
                event.preventDefault();
                this.inc_buy()
            }
        }

        {
            let button = container.querySelector('#buy_amount > .minus')
            button.onclick = (event) => {
                event.preventDefault();
                this.dec_buy()
            }
        }

        this.socket = socket;
    }

    inc_buy() {
        this.buy_amount += 1;
        this.update_buy();
    }

    dec_buy() {
        this.buy_amount = Math.max(0, this.buy_amount - 1)
        this.update_buy();
    }

    inc_sell() {
        this.sell_amount += 1
        this.update_sell();
    }

    dec_sell() {
        this.sell_amount = Math.max(0, this.sell_amount - 1)
        this.update_sell();
    }

    update_buy() {
        this.buy_amount_div.innerHTML = this.buy_amount;
    }

    update_sell() {
        this.sell_amount_div.innerHTML = this.sell_amount;
    }

    update_data(data) {
        console.log(data)
        this.data = data;
        for (let tag in data.buy) {
            let total_price = 0;
            let total_amount = 0;
            for (let order of data.buy[tag]) {
                total_price += order.price * order.amount
                total_amount += order.amount
            }
            for (let order of data.sell[tag]) {
                total_price += order.price * order.amount
                total_amount += order.amount
            }
            let div = this.container.querySelector('.' + tag + ' > .goods_avg_price')
            if (total_amount > 0) {
                div.innerHTML = total_price / total_amount
            } else {
                div.innerHTML = 'undefined'
            }
        }
    }
}