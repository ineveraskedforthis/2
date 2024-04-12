import { reputation_level } from "./character"

export type cell_id = number & {__brand:  "cell"}
export type character_id = number & { __brand: "character_id"}
export type user_id = number & { __brand: "user_id"}
export type user_online_id = user_id & { __brand2: "online"}
export type location_id = number & { __brand: "location_id"}
export type market_order_id = number & { __brand: "bulk_order"}
export type order_item_id_raw = number & { __brand: "auction_order_id"; __brand2: "raw"}

export type TEMP_character_id = '@'

export type money   = number & { __brand: "money"}
export interface SavingsJson {
    data: money
}
export type damage_type = 'blunt' | 'pierce' | 'slice' | 'fire'
export type melee_attack_type = 'blunt' | 'pierce' | 'slice'
export type weapon_tag = 'polearms' | 'onehand' | 'ranged' | 'twohanded'
export type weapon_attack_tag = weapon_tag | 'noweapon'
export type world_coordinates = [number, number]
export type map_position = [number, number]
export type terrain = 'sea' | 'city' | 'steppe' | 'coast' | 'void'
export type status_type = 'hp' | 'rage' | 'blood' | 'stress' | 'fatigue'

export interface ReputationData {
    faction_id: string
    reputation: reputation_level
}

export interface ReputationDataSocket extends ReputationData {
    faction_name: string;
}

export interface Faction {
    tag: string
    name: string
}


export interface CellView {
    index: cell_id,
    terrain: Terrain,
    scent: number,
    population: number
}

export const enum Terrain {
    void,
    steppe,
    sea,
    coast,
    rupture,
    ashlands
}
