import { set_up_header_tab_choice } from '../../headers.js';
import { elementById } from '../HTMLwrappers/common.js';
export function set_up_market_headers() {
    let market_button = elementById('open_market');
    let auction_button = elementById('open_auction');
    let market = elementById('market_wrapper');
    let auction = elementById('auction_wrapper');
    set_up_header_tab_choice([
        { element: market_button, connected_element: market },
        { element: auction_button, connected_element: auction }
    ]);
}
