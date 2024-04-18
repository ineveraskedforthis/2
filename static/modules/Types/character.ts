import { LocationView } from "@custom_types/responses";
import { Value } from "../Values/collection";
import { MATERIAL, material_string_id } from "@content/content";

export interface ValueInterface {
    id: string;
    value: number;
}

export interface AnimatedValueInterface extends ValueInterface, DependencyUI {
    display_value: number;
}

export interface LimitedValueInterface extends ValueInterface {
    max_value: number;
}

export interface BulkAmountInterface extends ValueInterface {
    material_index: MATERIAL;
    material_string: string;
}

export type DamageTag = 'fire'|'blunt'|'pierce'|'slice'
export type PerDamageNumber = Record<DamageTag, number>

export interface AttackView {
    damage: PerDamageNumber
}

export interface ChatMessage {
    msg: string
    user: string
}

export interface BattleLogData {
    role: 'defender'|'attacker',
    attack : AttackView,
    res: PerDamageNumber,

    total: number
}

export interface DependencyUI {
    update_display: () => void;
}

export interface DependencyUICanvas {
    update_canvas_size: () => void
}

export interface CharacterDataBasic {
    id: number,
    name: string,
}

export interface CharacterDataExpanded extends CharacterDataBasic {
    savings: ValueInterface,
    savings_trade: ValueInterface,
    location_id: Value,
    stash: ValueInterface[]
}