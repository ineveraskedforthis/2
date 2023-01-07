import { GoodsMarket } from './modules/Market/market_table.js';
import { socket } from './modules/globals.js';
import { set_up_header_tab_choice } from './headers.js'

export const goods_market = new GoodsMarket(document.querySelector('.goods_market'), socket);

{
    let market_button = document.getElementById('open_market');
    let auction_button = document.getElementById('open_auction');

    let market = document.querySelector('.goods_market');
    let auction = document.querySelector('.auction_body');

    set_up_header_tab_choice([
        {element: market_button, connected_element: market},
        {element: auction_button, connected_element: auction}
    ])
}
