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

export interface SavingsJson {
    data: money
}

export type weapon_tag = 'polearms'|'onehand'|'ranged'|'twohanded'
export type weapon_attack_tag = weapon_tag | 'unarmed'
export type equip_slot = 'body'|'legs'|'arms'|'head'|'foot'|'weapon'
export type armour_slot = 'body'|'legs'|'arms'|'head'|'foot'
export const armour_slots:armour_slot[] = ['body', 'legs', 'arms', 'head', 'foot']


export type world_dimensions = [number, number]
export type map_position = [number, number]
export type terrain = 'sea' | 'city' | 'steppe' | 'coast' | 'void'