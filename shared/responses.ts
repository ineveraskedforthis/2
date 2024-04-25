import { EQUIP_SLOT, MATERIAL, PERK, SKILL } from "@content/content";
import { ReputationDataSocket, Terrain, money } from "./common";
import { cell_id, character_id, location_id, market_order_id } from "./ids";
import { equip } from "./inventory";

export type PerksResponse = {
    name: string,
    race: string,
    factions: ReputationDataSocket[]
    perks: Partial<Record<PERK, money>>
    skills: Partial<Record<SKILL, [number, number]>>,
    current_goal: string,
    model: string,
    equip: {[_ in EQUIP_SLOT]?: string}
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
    id: character_id;
    name: string;
    dead: boolean;
    robbed: boolean;
    race: string;
    equip: equip,
    body: string
}

export interface BulkOrderView {
    typ: 'sell'|'buy',
    tag: MATERIAL,
    owner_id: character_id,
    owner_name: string,
    amount: number
    price: money
    id: market_order_id
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
    material: MATERIAL;
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
    terrain: Terrain,
    urbanisation: number,
}
