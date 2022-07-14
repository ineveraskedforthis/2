export interface PositionSocket {
    x: number
    y: number
}

export interface SocketBattleUnitData {
    tag: string,
    position: PositionSocket
    range: number
    name: string 
    hp: number
    ap: number
    id: number
}

export type SocketBattleData = {[_ in number]: SocketBattleUnitData};

export type battle_id = number & { __brand: "battle"}