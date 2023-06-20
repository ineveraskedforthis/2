export const enum AIstate {
    Idle = 'idle',
    WaitSale = 'wait_sale',
    WaitBuy = 'wait_buy',
    Patrol = 'patrol',
    GoToMarket = 'go_to_market',
    PatrolPrices = 'patrol_prices',
    Talking = 'talking',
    GoToRest = 'go_to_rest',
}

export const enum AImemory {
    WAS_ON_MARKET = 'was_on_market',
}