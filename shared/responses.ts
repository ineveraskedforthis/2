import { Perks, reputation_level } from "./character";
import { ReputationData, ReputationDataSocket, cell_id, character_id, location_id, money } from "./common";
import { equip_slot } from "./inventory";

export type PerksResponse = {
    name: string,
    race: string,
    factions: ReputationDataSocket[]
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
export interface CharacterView {
    id: number;
    name: string;
    dead: boolean;
}
export interface BulkOrderView {
    tag: number;
    amount: number;
    price: number;
    id: number;
    typ: string;
    owner_id: number;
    owner_name: string;
}
export interface CraftItemView {
    id: string;
    output_model: string;
    input: ItemAmountView[];
}
export interface CraftBulkUpdateView {
    tag: string;
    value: ItemAmountView[];
}
export interface CraftItemUpdateView {
    tag: string;
    value: number;
}
export interface ItemAmountView {
    amount: number;
    material: number;
}
export interface CraftBulkView {
    id: string;
    output: ItemAmountView[];
    input: ItemAmountView[];
}

export interface LocationView {
    id: location_id,
    room_cost: money,
    guests: number,
    durability: number,
    owner_id: character_id|-1,
    owner_name: string,
    cell_id: cell_id,
    house_level: number,
    forest: number,
}
