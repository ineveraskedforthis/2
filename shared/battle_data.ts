import { character_id } from "./ids";

export type battle_id = number & { __brand: "battle"}

export interface position {
    x: number
    y: number
}

export interface Socket {
    on(event: string, callback: (data: any) => void ):void;
    emit(event: string, data?: any):void;
}

export type battle_position = position & { __brand: "battle"}
export type BattleEventTag = 'end_turn'|'move'|'attack'|'miss'|'ranged_attack'|'flee'|'new_turn'|'update'|'unit_join'|'unit_left';

export interface BattleActionRecordPosition {
    type: "position",
    target: battle_position,
    action: BattleEventTag,
}

export interface BattleActionRecordUnit {
    type: "unit",
    target: character_id,
    action: BattleEventTag,
}

export interface UnitSocket {
    tag: string,//model

    name: string

    hp: number
    max_hp: number

    ap: number,
    max_ap: number,

    id: character_id

    next_turn: number
    dead: boolean

    range: number
    move_cost: number
    position: battle_position

    action: BattleActionRecordUnit|BattleActionRecordPosition
}

export interface BattleActionChance {
    tag: string,
    value: number
}

export interface BattleKeyframeSocket{
    index: number // keyframes are numbered, they should be treated in succession if possible
    data: UnitSocket[]
}

export type BattleData = {[_ in number]: UnitSocket};

export type action_points = number & { __brand: "action_point"}
export type ms = number & { __brand: "ms" }
export type seconds = number & { __brand: "seconds" }

export interface BattleActionData {
    name: string,
    tag: string,
    cost: number,
    probability: number,
    damage: number,
    target: 'self'|'unit'|'position',
    possible: boolean
}

export type ActionSelfKeys = 'Flee'|'EndTurn'|'RandomStep'
export type ActionUnitKeys =
    'Pierce'
    |'Slash'
    |'Knock'
    |'Ranged'
    |'MoveTowards'
    |'SwitchWeapon'
    |'MagicBoltZAZ'
    |'MagicBoltBlood'
    |'MagicBolt';
export type ActionPositionKeys = 'Move'