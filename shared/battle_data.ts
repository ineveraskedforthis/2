export type unit_id = number & { __brand: "unit"}
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

export interface UnitSocket {
    tag: string,//model
    position: battle_position
    range: number
    name: string 
    hp: number
    max_hp: number
    ap: number
    id: unit_id
    next_turn: number
    dead: boolean
    move_cost: number
}

export interface BattleActionChance {
    tag: string,
    value: number
}


export type BattleEventTag = 'end_turn'|'move'|'attack'|'miss'|'ranged_attack'|'flee'|'new_turn'|'update'|'unit_join'|'unit_left';
export interface BattleEventSocket{
    tag: BattleEventTag
    creator: unit_id
    target_position: battle_position
    target_unit: unit_id
    cost: number
    index: number // events are numbered, they should be treated in succession
    data?: UnitSocket
}



export type BattleData = {[_ in number]: UnitSocket};

export type action_points = number & { __brand: "action_point"}
export type ms = number & { __brand: "ms" }


export interface MoveAction {action: "move", target: battle_position}
export interface AttackAction {action: "attack", target: unit_id}
export interface HeavyAttackAction {action: "heavy_attack", target: unit_id}
export interface FastAttackAction {action: "fast_attack", target: unit_id}
export interface ChargeAction {action: "charge", target: unit_id}
export interface DodgeAction {action: "dodge", who: unit_id}
export interface ShootAction {action: "shoot", target: unit_id}
export interface PushBack {action: "push_back", target: unit_id}
export interface FleeAction {action: "flee", who: unit_id}
export interface MagicBoltAction {action: "magic_bolt", target: unit_id}
export interface SpellTargetAction {action: "spell_target", target: unit_id, spell_tag: "charge"|"bolt"}
export interface EndTurn {action: 'end_turn'}
export interface NullAction {action: null}
export interface SwitchWeaponAction {action: "switch_weapon", who: unit_id}
export type Action = MoveAction|AttackAction|FleeAction|SpellTargetAction|EndTurn|NullAction|FastAttackAction|DodgeAction|PushBack|MagicBoltAction|SwitchWeaponAction|ShootAction
export type ActionTag = 'move'|'attack'|'flee'|'spell_target'|'end_turn'|null|'heavy_attack'|'dodge'|'push_back'|'magic_bolt'|'switch_weapon'|'shoot'

export type ActionLog = Action[]