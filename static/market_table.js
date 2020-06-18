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
        console.log(data)
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
        for (var i of this.data) {
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
        this.draw();
    }
}