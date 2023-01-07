import { GoodsMarket } from './modules/Market/market_table.js';
import { socket } from './modules/globals.js';

// market



export const goods_market = new GoodsMarket(document.querySelector('.goods_market'), socket);
{
    let market_button = document.getElementById('open_market');
    let auction_button = document.getElementById('open_auction');

    let market = document.querySelector('.goods_market');
    let auction = document.querySelector('.auction_body');

    market_button.onclick = () => {
        market.classList.remove('hidden');
        auction.classList.add('hidden');

        auction_button.classList.remove('selected');
        market_button.classList.add('selected');
    };

    auction_button.onclick = () => {
        market.classList.add('hidden');
        auction.classList.remove('hidden');

        market_button.classList.remove('selected');
        auction_button.classList.add('selected');
    };

}
