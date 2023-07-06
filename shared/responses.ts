import { Perks, reputation_level } from "./character";
import { equip_slot } from "./inventory";

export type PerksResponse = {
    name: string,
    race: string,
    factions: { tag: string; name: string; reputation: reputation_level }[]
    perks: {[_ in Perks]?: number}
    skills: {[_ in string]?: [number, number]},
    current_goal: string,
    model: string,
    equip: {[_ in equip_slot]?: string}
}

export type CharacterStatsResponse = {
    phys_power: number,
    magic_power: number,
    enchant_rating: number,
    movement_cost: number,
    move_duration_map: number,
    base_damage_magic_bolt: number
    base_damage_magic_bolt_charged: number
}

export type CellDisplay = {
    terrain: string,
    forestation: number,
    urbanisation: number,
    rat_lair: boolean
}