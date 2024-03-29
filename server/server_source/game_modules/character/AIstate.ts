export const enum AIstate {
    Idle = 'idle',
    WaitSale = 'wait_sale',
    WaitBuy = 'wait_buy',
    Patrol = 'patrol',
    GoToMarket = 'go_to_market',
    PatrolPrices = 'patrol_prices',
    Talking = 'talking',
    GoToRest = 'go_to_rest',
    Craft = 'craft',
    Trading = 'trading'
}

export const enum AImemory {
    WAS_ON_MARKET = 'was_on_market',
    NO_MONEY = 'no_money',
    RESTED = 'rested',
    NO_FOOD = 'no_food',
}