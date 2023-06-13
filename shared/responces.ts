import { Perks, reputation_level } from "./character";

export type PerksResponce = {
    name: string,
    race: string,
    factions: { tag: string; name: string; reputation: reputation_level }[]
    perks: {[_ in Perks]?: number}
    skills: {[_ in string]?: [number, number]}
}

export type CharacterStatsResponce = {
    phys_power: number,
    magic_power: number,
    enchant_rating: number,
    movement_cost: number,
    move_duration_map: number,
    base_damage_magic_bolt: number
}