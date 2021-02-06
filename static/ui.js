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



socket.on('item-market-data', data => {
    // console.log('item-market-data'); 
    // console.log(data); 
    item_market_table.update(data)
});
// socket.on('market-data', data => auction_house.update(data));
// socket.on('market-data', data => console.log(data));

socket.on('tags-tactic', msg => tactic_screen.update_tags(msg));
socket.on('tactic', msg => tactic_screen.update(msg));





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

var item_market_table = new ItemMarketTable(document.getElementById('auction_house_tab'))
// var auction_house = new AuctionHouse(document.getElementById('auction_house_tab'));
socket.emit('get-market-data', null);// eslint-disable-next-line no-undef

// eslint-disable-next-line no-undef
var tactic_screen = new TacticScreen(document.getElementById('tactic'), socket);
// eslint-disable-next-line no-undef
var character_screen = new CharacterScreen(socket);

