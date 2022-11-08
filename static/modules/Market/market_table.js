

export class GoodsMarket {
    constructor(container, socket) {
        this.container = container;
        this.buy_amount_div = container.querySelector('#buy_amount > .current')
        this.sell_amount_div = container.querySelector('#sell_amount > .current')
        this.sell_amount = 0;
        this.buy_amount = 0;
        // {
        //     let button = container.querySelector('#sell_amount > .plus')
        //     // button.onclick = (event) => {
        //     //     event.preventDefault();
        //     //     this.inc_sell()
        //     // }
        // }

        // {
        //     let button = container.querySelector('#sell_amount > .minus')
        //     button.onclick = (event) => {
        //         event.preventDefault();
        //         this.dec_sell()
        //     }
        // }

        // {
        //     let button = container.querySelector('#buy_amount > .plus')
        //     button.onclick = (event) => {
        //         event.preventDefault();
        //         this.inc_buy()
        //     }
        // }

        // {
        //     let button = container.querySelector('#buy_amount > .minus')
        //     button.onclick = (event) => {
        //         event.preventDefault();
        //         this.dec_buy()
        //     }
        // }

        // {
        //     let button = container.querySelector('#confirm_buy')
        //     button.onclick = (event) => {
        //         event.preventDefault();
        //         this.buy()
        //     }
        // }

        // {
        //     let button = container.querySelector('#confirm_sell')
        //     button.onclick = (event) => {
        //         event.preventDefault();
        //         this.sell()
        //     }
        // }

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
        this.update_estimation(this.selected_tag);
    }

    update_sell() {
        this.sell_amount_div.innerHTML = this.sell_amount;
        this.update_sell_estimation(this.selected_tag)
    }

    update_data(data) {
        console.log('update_data')
        console.log(data)
        this.data = data;
        for (let tag in data.buy) {
            let total_price = 0;
            let total_amount = 0;

            for (let order of data.buy[tag]) {
                total_price += order.price * order.amount
                total_amount += order.amount
            }

            let div = this.container.querySelector('.' + tag + ' > .goods_avg_buy_price')
            if (total_amount > 0) {
                div.innerHTML = total_price / total_amount
            } else {
                div.innerHTML = 'undefined'
            }     
            
        }

        for (let tag in data.sell) {
            let total_price = 0;
            let total_amount = 0;

            for (let order of data.sell[tag]) {
                total_price += order.price * order.amount
                total_amount += order.amount
            }   

            let div = this.container.querySelector('.' + tag + ' > .goods_avg_sell_price')
            if (total_amount > 0) {
                div.innerHTML = total_price / total_amount
            } else {
                div.innerHTML = 'undefined'
            }  
            
        }
        if (this.selected_tag != undefined) {
            this.update_estimation(this.selected_tag)
            this.update_sell_estimation(this.selected_tag)
        }
    }

    select(tag) {
        if (this.selected_tag != undefined) {
            let div = this.container.querySelector('.' + this.selected_tag);
            div.classList.remove('selected');
        }
        this.selected_tag = tag;
        let desc = this.container.querySelector('.description')
        desc.innerHTML = tag
        let div = this.container.querySelector('.' + this.selected_tag);
        div.classList.add('selected');
        this.update_estimation(tag)
        this.update_sell_estimation(tag)
    }

    update_estimation(tag) {
        if (tag == undefined) {
            return
        }

        {
            let current_buy = this.container.querySelector("#buy_amount > .current").innerHTML
            let res = this.check_tag_cost(tag, parseInt(current_buy));
            let div = document.getElementById('buy_cost');
            div.innerHTML = res[0] + ', ' + (res[1]) + ' will be not bought'
        }
    }

    update_sell_estimation(tag) {
        if (tag == undefined) {
            return
        }

        {
            let current_sell = this.container.querySelector("#sell_amount > .current").innerHTML
            let res = this.check_tag_sell_profits(tag, parseInt(current_sell));
            let div = document.getElementById("profit");
            div.innerHTML = res[0] + ', and ' + (res[1]) + ' will be not sold'
        }
    }

    check_tag_cost(tag, amount) {
        var tmp = [];
        for (var order of this.data.sell[tag]) {
            tmp.push(order);
        }
        tmp.sort((a, b) => {a.price - b.price});
        var cost = 0;
        for (let i of tmp) {
            if (i.amount <= amount) {
                cost += i.amount * (i.price);
                amount -= i.amount;
            } else if (amount > 0) {
                cost += amount * (i.price);
                amount = 0;
            }
        }
        return [cost, amount]
    }

    check_tag_sell_profits(tag, amount) {
        var tmp = [];
        for (var order of this.data.buy[tag]) {
            tmp.push(order);
        }
        tmp.sort((a, b) => {-a.price + b.price});
        var profit = 0;
        for (let i of tmp) {
            if (i.amount <= amount) {
                profit += i.amount * (i.price);
                amount -= i.amount;
            } else if (amount > 0) {
                profit += amount * (i.price);
                amount = 0;
            }
        }
        return [profit, amount]
    }

    buy() {
        if (this.selected_tag == undefined) {
            return 
        }
        let tmp = this.check_tag_cost(this.selected_tag, this.buy_amount)
        this.socket.emit('buy', {tag: this.selected_tag,
                            amount: this.buy_amount - tmp[1],
                            money: tmp[0],
                            max_price: 99999});
    }

    sell() {
        if (this.selected_tag == undefined) {
            return 
        }
        let tmp = this.check_tag_sell_profits(this.selected_tag, this.sell_amount)
        this.socket.emit('sell', {tag: this.selected_tag ,
                             amount: this.sell_amount - tmp[1],
                             price: 1});
    }

    update_inventory(data) {
        for (let tag in this.stash_id_to_tag) {
            let div = this.container.querySelector('.' + this.stash_id_to_tag[tag] + ' > .goods_amount_in_inventory')
            if (div != null)  {
                div.innerHTML = data[tag] || 0
            }
        }
    }

    update_tags(stash_tag_to_id, stash_id_to_tag) {
        this.stash_tag_to_id = stash_tag_to_id
        this.stash_id_to_tag = stash_id_to_tag
    }
}