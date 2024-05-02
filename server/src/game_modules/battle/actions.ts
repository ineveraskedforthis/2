import { Attack } from "../attack/system"
import { Character } from "../data/entities/character"
import { can_cast_magic_bolt, can_cast_magic_bolt_blood, can_shoot, has_zaz } from "../character/checks"
import { Alerts } from "../client_communication/network_actions/alerts"
import { DmgOps } from "../damage_types"
import { Data } from "../data/data_objects"
import { Event } from "../events/events"
import { EventInventory } from "../events/inventory_events"
import { geom } from "../geom"
import { ItemSystem } from "../systems/items/item_system"
import { Accuracy } from "./battle_calcs"
import { Battle } from "./classes/battle"
import { BattleEvent } from "./events"
import { BattleTriggers } from "./TRIGGERS"
import { BattleActionExecution, BattleActionExecutionPosition, BattleActionExecutionTarget, BattleApCost, BattleApCostPosition, BattleApCostTarget, BattleNumber, BattleNumberTarget } from "./TYPES"
import { BattleValues } from "./VALUES"
import { action_points, ActionPositionKeys, ActionSelfKeys, ActionUnitKeys, battle_position, BattleActionPossibilityReason } from "@custom_types/battle_data"
import { EquipmentValues } from "../scripted-values/equipment-values"
import { CharacterValues } from "../scripted-values/character"

function attack_ap_cost(base: number, character: Character) {
    let result = base

    let weapon = EquipmentValues.weapon(character.equip)
    if (weapon != undefined) {
        result = base * ItemSystem.weight(weapon) / 4
    }

    const skill = CharacterValues.attack_skill(character)
    result = result * (1 - skill / 200)
    const power = CharacterValues.phys_power(character)
    result = result * (0.5 + 10 / power)

    return result as action_points
}

export type ActionSelf = {
    ap_cost: BattleApCost,
    execute: BattleActionExecution,
    // utility: BattleNumber,
    chance: BattleNumber,
}

export type ActionPosition = {
    ap_cost: BattleApCostPosition,
    execute: BattleActionExecutionPosition,
    // utility: BattlePositionNumber
}

export type ActionUnit = {
    valid: (character: Character) => boolean;
    ap_cost: BattleApCostTarget,
    range: BattleNumber,
    damage: BattleNumberTarget,
    execute: BattleActionExecutionTarget,
    // utility: BattleNumberTarget;
    chance: BattleNumberTarget,
    move_closer?: boolean,
    switch_weapon?: boolean
}

function always(character: Character): boolean {
    return true
}

const RANDOM_STEP_LENGTH = 2

export const ActionsSelf: {[_ in ActionSelfKeys]: ActionSelf} = {
    "Flee": {
        ap_cost: (battle: Battle, character: Character, ) => {
            return 3 as action_points
        },
        execute: (battle: Battle, character: Character, ) => {
            if (BattleTriggers.safe(battle)) {
                BattleEvent.Leave(battle, character)
                return
            }
            let dice = Math.random();
            if (dice <= BattleValues.flee_chance(character.position)) { // success
                Alerts.battle_event_simple(battle, 'flee', character)
                Alerts.battle_event_simple(battle, 'update', character)
                BattleEvent.Leave(battle, character)
                return
            }
            Alerts.battle_event_simple(battle, "flee", character)

        },
        chance: (battle: Battle, character: Character, ) => {
            return BattleValues.flee_chance(character.position)
        }
    },
    "EndTurn": {
        ap_cost: (battle: Battle, character: Character, ) => {
            return 0 as action_points
        },
        execute: (battle: Battle, character: Character, ) => {
            BattleEvent.EndTurn(battle, character)
        },
        chance: (battle: Battle, character: Character, ) => {
            return 1
        }
    },
    'RandomStep' : {
        // max_utility: 2,
        ap_cost: (battle: Battle, character: Character, ) => {
            return CharacterValues.movement_cost_battle(character) * RANDOM_STEP_LENGTH as action_points
        },
        execute: (battle: Battle, character: Character, available_points: action_points) => {
            const phi = Math.random() * Math.PI * 2
            const shift = {x: Math.cos(phi), y: Math.sin(phi)} as battle_position
            let target = geom.sum(character.position, geom.mult(shift, RANDOM_STEP_LENGTH))
            BattleEvent.Move(battle, character, target, available_points, false, )
        },
        chance: (battle: Battle, character: Character, ) => {
            return 1
        }
    },
}




export const ActionsUnit: Record<ActionUnitKeys, ActionUnit> = {
    'Pierce': {
        valid: always,
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ) => {
            return attack_ap_cost(2, character)
        },
        range: (battle: Battle, character: Character, ) => {
            return CharacterValues.range(character)
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let dodge_flag = (target_character.dodge_turns > 0)
            let a = character.position
            let b = target_character.position
            let c = geom.minus(b, a)
            let norm = geom.norm(c)
            let power_ratio = CharacterValues.phys_power(character) / CharacterValues.phys_power(target_character)
            let scale = CharacterValues.range(character) * power_ratio / norm
            c = geom.mult(c, scale)
            BattleEvent.SetCoord(battle, target_character, geom.sum(b, c))
            Event.attack(character, target_character, dodge_flag, 'pierce', false)
        },
        damage: (battle: Battle, character: Character, ) => {
            return DmgOps.total(Attack.generate_melee(character, 'pierce').damage)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        }
    },

    'Slash': {
        valid: always,
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ) => {
            return attack_ap_cost(3, character)
        },
        range: (battle: Battle, character: Character, ) => {
            return CharacterValues.range(character)
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let dodge_flag = (target_character.dodge_turns > 0)
            let range = CharacterValues.range(character)

            for (let aoe_target_id of battle.heap) {
                const aoe_target = Data.Characters.from_id(aoe_target_id)
                if (aoe_target == undefined) continue;

                if (character.id == aoe_target.id) continue
                if (geom.dist(character.position, aoe_target.position) > range) continue
                if (character.team == aoe_target.team) continue

                if (target_character.id != aoe_target.id) {
                    Event.attack(character, aoe_target, dodge_flag, 'slice', true)
                } else {
                    Event.attack(character, aoe_target, dodge_flag, 'slice', false)
                }

                Alerts.battle_event_target_unit(battle, 'attack', character, aoe_target)
                Alerts.battle_update_unit(battle, aoe_target)
            }
        },
        damage: (battle: Battle, character: Character, ) => {
            return DmgOps.total(Attack.generate_melee(character, 'slice').damage)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        }
    },

    'Knock': {
        valid: always,
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ) => {
            return attack_ap_cost(2, character)
        },
        range: (battle: Battle, character: Character, ) => {
            return CharacterValues.range(character)
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let dodge_flag = (target_character.dodge_turns > 0)
            let range = CharacterValues.range(character)

            Event.attack(character, target_character, dodge_flag, 'blunt', false)
            Alerts.battle_event_target_unit(battle, 'attack', character, target_character)
            Alerts.battle_update_unit(battle, character)
            Alerts.battle_update_unit(battle, target_character)
        },
        damage: (battle: Battle, character: Character, ) => {
            return DmgOps.total(Attack.generate_melee(character, 'blunt').damage)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        }
    },

    'Ranged': {
        valid: can_shoot,
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 3 as action_points
        },
        range: (battle: Battle, character: Character, ) => {
            return 9999
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let dist = geom.dist(character.position, target_character.position)
            Event.shoot(character, target_character, dist, target_character.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            const acc = Accuracy.ranged(character, distance)
            const attack = Attack.generate_ranged(character)
            return DmgOps.total(attack.damage) * acc
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            const acc = Accuracy.ranged(character, distance)
            return acc
        }
    },

    "MagicBolt": {
        valid: can_cast_magic_bolt,
        range: (battle: Battle, character: Character, ) => {
            return 999
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            Event.magic_bolt_mage(character, target_character, distance, target_character.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            return DmgOps.total(Attack.generate_magic_bolt(character, distance, false).damage)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        },
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1.5 as action_points
        }
    },

    "MagicBoltBlood": {
        valid: can_cast_magic_bolt_blood,
        range: (battle: Battle, character: Character, ) => {
            return 999
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            Event.magic_bolt_blood(character, target_character, distance, target_character.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            return DmgOps.total(Attack.generate_magic_bolt(character, distance, true).damage)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        },
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 2 as action_points
        }
    },

    "MagicBoltZAZ": {
        valid: has_zaz,
        range: (battle: Battle, character: Character, ) => {
            return 999
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            Event.magic_bolt_zaz(character, target_character, distance, target_character.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character,  target_character: Character, ) => {
            let distance = geom.dist(character.position, target_character.position)
            return DmgOps.total(Attack.generate_magic_bolt(character, distance, true).damage)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        },
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 3 as action_points
        }
    },

    "MoveTowards": {
        valid: always,
        range: (battle: Battle, character: Character, ) => {
            return 100
        },
        damage: (battle: Battle, character: Character, ) => {
            return 0
        },
        ap_cost: (battle: Battle, character: Character,  target_character: Character, ): action_points => {
            const delta = geom.minus(target_character.position, character.position);
            const dist = geom.norm(delta)
            const range = CharacterValues.range(character)
            const max_move = character.action_points_left / BattleValues.move_cost(character) // potential movement

            if (dist < range) {
                return 0 as action_points
            }
            let distance_to_walk = Math.min(dist - range + 0.01, max_move)
            // console.log('ap cost to move close is ' + distance_to_walk * BattleValues.move_cost(character))
            // console.log('current ap:' + character.action_points_left)
            return distance_to_walk * BattleValues.move_cost(character) as action_points
        },
        execute: (battle: Battle, character: Character, target_character: Character, available_points: action_points) => {
            const delta = geom.minus(target_character.position, character.position);
            const dist = geom.norm(delta)
            const range = CharacterValues.range(character)
            const max_move = available_points / BattleValues.move_cost(character) // potential movement
            if (dist < range) {
                return
            }
            let direction = geom.normalize(delta)
            let distance_to_walk = Math.min(dist - range + 0.01, max_move)
            let target = geom.sum(character.position, geom.mult(direction, distance_to_walk))

            BattleEvent.Move(battle, character, target, available_points, false)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        },
        move_closer: true
    },

    "SwitchWeapon": {
        valid: always,
        range: (battle: Battle, character: Character, ) => {
            return 9999
        },
        ap_cost: (battle: Battle, character: Character, ): action_points => {
            return 0 as action_points
        },
        damage: (battle: Battle, character: Character, ) => {
            return 0
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            EventInventory.switch_weapon(character)
        },
        chance: (battle: Battle, character: Character,  target_character: Character, ) => {
            return 1
        },
        switch_weapon: true
    }
}



export const ActionsPosition: { [key in ActionPositionKeys]: ActionPosition} = {
    'Move': {
        ap_cost: (battle: Battle, character: Character, target: battle_position) => {
            const distance = geom.dist(character.position, target)
            // console.log(target, distance, BattleValues.move_cost(character))
            return Math.min(distance * BattleValues.move_cost(character), character.action_points_left) as action_points
        },
        execute: (battle: Battle, character: Character,  target: battle_position, available_points: action_points) => {
            BattleEvent.Move(battle, character, target, available_points, false)
        }
    }
}


const action_currrent = ActionsSelf.Flee

type BattleActionResponse =
    {response: "NOT_ENOUGH_AP", current: number, needed: number}
    | {response: "INVALID_ACTION"}
    | {response: "OK", ap_cost: action_points, action: ActionSelf}
    | {response: "NOT_ENOUGH_RANGE"}

type BattleActionUnitResponse =
    {response: "NOT_ENOUGH_AP", current: number, needed: number}
    | {response: "INVALID_ACTION"}
    | {response: "OK", ap_cost: action_points, action: ActionUnit}
    | {response: "NOT_ENOUGH_RANGE"}
    | {response: "ATTEMPT_IS_INVALID"}

type BattleActionPositionResponse =
    {response: "NOT_ENOUGH_AP", current: number, needed: number}
    | {response: "INVALID_ACTION"}
    | {response: "OK", ap_cost: action_points, action: ActionPosition};

function response_to_alert(character: Character, response: BattleActionPossibilityReason) {
    switch(response) {
        case BattleActionPossibilityReason.Okay:return;
        case BattleActionPossibilityReason.NotEnoughAP:{Alerts.alert(character, "Not enough action points."); return}
        case BattleActionPossibilityReason.FarAway:{Alerts.alert(character, "You are too far away."); return}
        case BattleActionPossibilityReason.NoResource:{Alerts.alert(character, "You don't have enough resources."); return};
        case BattleActionPossibilityReason.InvalidAction:{Alerts.alert(character, "You are trying to do an undefined action."); return}
    }
}

export function is_action_self_key(s: string): s is ActionSelfKeys {
    if (s in ActionsSelf) return true
    return false
}
export function is_action_position_key(s: string): s is ActionPositionKeys {
    if (s in ActionsPosition) return true
    return false
}
export function is_action_unit_key(s: string): s is ActionUnitKeys {
    if (s in ActionsUnit) return true
    return false
}

export function battle_action_self_check(
    action: ActionSelf,
    battle: Battle,
    character: Character,
    d_ap: action_points
) : BattleActionPossibilityReason
{
    const ap_cost = action.ap_cost(battle, character)
    if (character.action_points_left + d_ap < ap_cost) {
        return BattleActionPossibilityReason.NotEnoughAP
    }
    return BattleActionPossibilityReason.Okay
}

export function battle_action_unit_check(
    action: ActionUnit,
    battle: Battle,
    character: Character,
    target_character: Character,
    d_distance: number, d_ap: number
) : BattleActionPossibilityReason
{
    const ap_cost = action.ap_cost(battle, character, target_character)
    if (character.action_points_left + d_ap < ap_cost) {
        return BattleActionPossibilityReason.NotEnoughAP
    }
    const range = action.range(battle, character)
    const dist = geom.dist(character.position, target_character.position)
    if (range + d_distance < dist) {
        return BattleActionPossibilityReason.FarAway
    }
    if (!action.valid(character)) {
        return BattleActionPossibilityReason.InvalidAction
    }
    return BattleActionPossibilityReason.Okay
}

export function battle_action_position_check(
    action: ActionPosition,
    battle: Battle,
    character: Character,
    target: battle_position
): BattleActionPossibilityReason {
    const ap_cost = action.ap_cost(battle, character, target)
    if ((character.action_points_left < ap_cost - 0.01) || (character.action_points_left == 0)) {
        return BattleActionPossibilityReason.NotEnoughAP
    }
    return BattleActionPossibilityReason.Okay
}

export function battle_action_self(tag: string, battle: Battle, character: Character, ): BattleActionPossibilityReason {
    if(!is_action_self_key(tag)) return BattleActionPossibilityReason.InvalidAction
    const action = ActionsSelf[tag]

    let result = battle_action_self_check(action, battle, character, 0 as action_points)
    if (result == BattleActionPossibilityReason.Okay) {
        const ap_cost = action.ap_cost(battle, character)
        character.action_points_left = character.action_points_left - ap_cost as action_points
        action.execute(battle, character, ap_cost)
    }
    response_to_alert(character, result)
    return result
}

export function battle_action_character(tag: ActionUnitKeys, battle: Battle, character: Character,  target_character: Character, ) {
    if(!is_action_unit_key(tag)) return BattleActionPossibilityReason.InvalidAction
    const action = ActionsUnit[tag]

    let result = battle_action_unit_check(action, battle, character, target_character, 0, 0)
    console.log(character.get_name(), 'attempts to ', tag, 'to', target_character.get_name())
    console.log(result)
    if (result == BattleActionPossibilityReason.Okay) {
        const ap_cost = action.ap_cost(battle, character, target_character)
        character.action_points_left = character.action_points_left - ap_cost as action_points
        action.execute(battle, character, target_character, ap_cost)
        Alerts.battle_update_unit(battle, character)
        Alerts.battle_update_unit(battle, target_character)
    }
    response_to_alert(character, result)
    return result
}

export function battle_action_position(tag: ActionPositionKeys, battle: Battle, character: Character,  target: battle_position) {
    if(!is_action_position_key(tag)) return BattleActionPossibilityReason.InvalidAction
    const action = ActionsPosition[tag]

    let result = battle_action_position_check(action, battle, character, target)
    console.log(character.get_name(), 'attempts to ', tag)
    console.log(result)
    if (result == BattleActionPossibilityReason.Okay) {
        const ap_cost = action.ap_cost(battle, character, target)
        character.action_points_left = character.action_points_left - ap_cost as action_points
        action.execute(battle, character, target, ap_cost)

        if (character.action_points_left < 0) {
            character.action_points_left = 0 as action_points
        }
    }
    response_to_alert(character, result)
    return result
}