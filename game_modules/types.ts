export type char_id = number                & {__brand:  "character_id"}
export type TEMP_CHAR_ID = '@' 
export type user_id = number                & {__brand:  "user_id"}
export type user_online_id = user_id        & {__brand2: "online"}
export type TEMP_USER_ID = '#'
export type cell_id = number                & {__brand:  "cell"}
export type order_bulk_id = number        & { __brand: "bulk_order"}
export type order_item_id = number          & { __brand: "auction_order_id"}
export type order_item_id_raw = number      & { __brand: "auction_order_id", __brand2: "raw"}

export type money = number & { __brand: "money"}

type savings_json = {
    data: money,
    prev_data: money,
    income: number
}