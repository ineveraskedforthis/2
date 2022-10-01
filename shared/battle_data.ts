export type unit_id = number & { __brand: "unit"}
export type battle_id = number & { __brand: "battle"}

export interface position {
    x: number
    y: number
}

export type battle_position = position & { __brand: "battle"}

export interface UnitData {
    tag: string,
    position: battle_position
    range: number
    name: string 
    hp: number
    ap: number
    id: number
}


export type BattleEventTag = 'end_turn'|'move'|'attack'
export interface BattleEventSocket{
    tag: BattleEventTag
    creator: unit_id
    target_position: battle_position
    target_unit: unit_id
    index: number // events are numbered, they should be treated in succession
}


export type BattleData = {[_ in number]: UnitData};

export type action_points = number & { __brand: "action_point"}
export type ms = number & { __brand: "ms" }