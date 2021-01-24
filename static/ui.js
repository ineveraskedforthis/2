


// eslint-disable-next-line no-undef
var socket = io();


// var dps = {
//     food: [],
//     meat: [],
//     leather: [],
//     clothes: [],
//     tools: [],
// }
// var chart = new CanvasJS.Chart("chartContainer", {
//     title :{
//         text: "prices"
//     },
//     toolTip: {
//         shared: true
//     },
//     data: [
//         {
//             type: "line",
//             name: 'food',
//             dataPoints: dps['food']
//         },
//         {
//             type: "line",
//             name: 'meat',
//             dataPoints: dps['meat']
//         },
//         {
//             type: "line",
//             name: 'leather',
//             dataPoints: dps['leather']
//         },
//         {
//             type: "line",
//             name: 'clothes',
//             dataPoints: dps['clothes']
//         },
//         {
//             type: "line",
//             name: 'tools',
//             dataPoints: dps['tools']
//         }
//     ]
// });

// var xVal = 0;
// var yVal = 100;
// var dataLength = 300; // number of dataPoints visible at any point

var updateChart = function (tag, x) {
    // yVal = x;
    // dps[tag].push({
    //     x: xVal,
    //     y: yVal
    // });
	// if (dps[tag].length > dataLength) {
	// 	dps[tag].shift();
	// }
};

// chart.render();



//battle canvas pressed
let bcp = false




// tutorial
document.getElementById('tutorial_status').onmouseover = event => {
    let status_frame = document.getElementById("status_frame")
    // status_frame.style.border = '1px solid yellow';
    status_frame.style.backgroundColor = 'rgb(100, 100, 0, 0.5)'
};
document.getElementById('tutorial_status').onmouseout = event => {
    let status_frame = document.getElementById("status_frame")
    // status_frame.style.border = '0px solid yellow';
    status_frame.style.backgroundColor = 'rgb(78, 11, 11, 0.7)'
};

document.getElementById('tutorial_buttons').onmouseover = event => {
    let status_frame = document.getElementById("control_frame")
    // status_frame.style.border = '1px solid yellow';
    status_frame.style.backgroundColor = 'rgb(100, 100, 0, 0.5)'
};
document.getElementById('tutorial_buttons').onmouseout = event => {
    let status_frame = document.getElementById("control_frame")
    // status_frame.style.border = '0px solid yellow';
    status_frame.style.backgroundColor = 'rgb(78, 11, 11, 0.7)'
};

function show_tutorial() {
    showTab('tutorial');
}


document.getElementById('buy_form_con').onsubmit = (event) => {
    event.preventDefault();
    let tag = document.getElementById('buy_tag_select').value;
    let amount = parseInt(document.getElementById('buy_amount').value);
    let max_price = parseInt(document.getElementById('buy_max_price').value);
    let money = amount * max_price;
    socket.emit('buy', {tag: tag,
                        amount: amount,
                        money: money,
                        max_price: max_price});
}

document.getElementById('sell_form_con').onsubmit = (event) => {
    event.preventDefault();
    let tag = document.getElementById('sell_tag_select').value;
    let amount = document.getElementById('sell_amount').value;
    let price = document.getElementById('sell_price').value;
    socket.emit('sell', {tag: tag,
                         amount: amount,
                         price: price});
}


let market_actions = document.getElementById('market_actions');

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('sell', {tag: 'meat', amount: '1', price: '100'})
)();
this.button.innerHTML = 'SELL 1 MEAT FOR 100';
market_actions.appendChild(this.button);

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('buy', {tag: 'food', amount: '1', money: '150', max_price: '150'})
)();
this.button.innerHTML = 'BUY 1 FOOD FOR 150';
market_actions.appendChild(this.button);

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('buy', {tag: 'water', amount: '1', money: '100', max_price: '100'})
)();
this.button.innerHTML = 'BUY 1 WATER FOR 100';
market_actions.appendChild(this.button);

this.button = document.createElement('button');
(() => 
        this.button.onclick = () => socket.emit('clear_orders')
)();
this.button.innerHTML = 'CLEAR ORDERS';
market_actions.appendChild(this.button);



socket.on('market-data', data => {
    // console.log(data);
    market_table.update(data);
    // updateChart('meat', data.avg['meat']);
    // updateChart('food', data.avg['food']);
    // updateChart('leather', data.avg['leather']);
    // updateChart('clothes', data.avg['clothes']);
    // updateChart('tools', data.avg['tools']);
    // xVal++;
    // chart.render()
});
socket.on('item-market-data', data => {
    // console.log('item-market-data'); 
    // console.log(data); 
    item_market_table.update(data)
});
// socket.on('market-data', data => auction_house.update(data));
// socket.on('market-data', data => console.log(data));

socket.on('tags-tactic', msg => tactic_screen.update_tags(msg));
socket.on('tactic', msg => tactic_screen.update(msg));
socket.on('char-info-detailed', msg => character_screen.update(msg))











function update_tags(msg) {
    for (var tag of msg) {
        var tag_option = new Option(tag, tag);
        document.getElementById('buy_tag_select').add(tag_option);
        tag_option = new Option(tag, tag);
        document.getElementById('sell_tag_select').add(tag_option);
        document.getElementById('inv_' + tag + '_image').style = "background: no-repeat center/100% url(/static/img/stash_" + tag + ".png);"
    }
}

function my_alert(msg) {
    if (msg != 'ok') {
        alert(msg);
    }
}

function login(msg) {
    if (msg != 'ok') {
        alert(msg);
    } else if (msg == 'ok') {
        tactic_screen.reset_tactic()
        show_game();
    }
    let tutorial_stage = localStorage.getItem('tutorial');
    if (tutorial_stage == null) {
        show_tutorial(0);
    }
}

function reg(msg) {
    if (msg != 'ok') {
        alert(msg);
    } else if (msg == 'ok') {
        tactic_screen.reset_tactic()
        show_game();
    }
}



// eslint-disable-next-line no-undef
var char_image = new CharacterImage(document.getElementById('char_image'));
// eslint-disable-next-line no-undef

// eslint-disable-next-line no-undef
var market_table = new MarketTable(document.getElementById('market'));
socket.emit('get-market-data', null);
var item_market_table = new ItemMarketTable(document.getElementById('auction_house_tab'))
// var auction_house = new AuctionHouse(document.getElementById('auction_house_tab'));
socket.emit('get-market-data', null);// eslint-disable-next-line no-undef

// eslint-disable-next-line no-undef
var tactic_screen = new TacticScreen(document.getElementById('tactic'), socket);
// eslint-disable-next-line no-undef
var character_screen = new CharacterScreen(socket);

