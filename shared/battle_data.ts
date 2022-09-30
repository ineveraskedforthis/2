export interface BattlePosition {
    x: number
    y: number
}

export interface UnitData {
    tag: string,
    position: BattlePosition
    range: number
    name: string 
    hp: number
    ap: number
    id: number
}

export type BattleData = {[_ in number]: UnitData};

export type battle_id = number & { __brand: "battle"}
export type action_points = number & { __brand: "action_point"}

export type ms = number & { __brand: "ms" }