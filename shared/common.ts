import { cell_id } from "./ids"
import { reputation_level } from "./character"

export type TEMP_character_id = '@'

export type money   = number & { __brand: "money"}
export interface SavingsJson {
    data: money
}
export type damage_type = 'blunt' | 'pierce' | 'slice' | 'fire'
export type melee_attack_type = 'blunt' | 'pierce' | 'slice'
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
