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

class MarketTable {
    constructor(container) {
        this.data = [];
        this.container = container;
        this.table = document.createElement('table');
    }

    draw() {
        this.container.textContent = '';
        this.container.appendChild(this.table);
    }

    update(data = []) {
        // console.log(data)
        this.data = data;
        this.table = document.createElement('table');
        let header = this.table.insertRow();
        let type = header.insertCell(0);
        let tag = header.insertCell(1);
        let amount = header.insertCell(2);
        let price = header.insertCell(3);
        let name = header.insertCell(4);
        type.innerHTML = 'type'
        tag.innerHTML = 'tag'
        amount.innerHTML = 'amount'
        price.innerHTML = 'price'
        name.innerHTML = 'name'
        for (tag in this.data.buy) {
            for (let i of this.data.buy[tag]) {
                let row = this.table.insertRow();
                let type = row.insertCell(0);
                let tag = row.insertCell(1);
                let amount = row.insertCell(2);
                let price = row.insertCell(3);
                let name = row.insertCell(4);
                type.innerHTML = i.typ
                tag.innerHTML = i.tag
                amount.innerHTML = i.amount
                price.innerHTML = i.price
                name.innerHTML = i.owner_name
            }
            for (let i of this.data.sell[tag]) {
                let row = this.table.insertRow();
                let type = row.insertCell(0);
                let tag = row.insertCell(1);
                let amount = row.insertCell(2);
                let price = row.insertCell(3);
                let name = row.insertCell(4);
                type.innerHTML = i.typ
                tag.innerHTML = i.tag
                amount.innerHTML = i.amount
                price.innerHTML = i.price
                name.innerHTML = i.owner_name
            }
        }
        
        this.draw();
    }
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

export class Market {
    constructor(container, socket) {
        this.container = container;
        this.socket = socket;
    }

    
}