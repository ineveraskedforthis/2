import { Attack } from "../attack/system"
import { Character } from "../character/character"
import { can_cast_magic_bolt, can_cast_magic_bolt_blood, can_shoot, has_zaz } from "../character/checks"
import { CharacterSystem } from "../character/system"
import { Alerts } from "../client_communication/network_actions/alerts"
import { DmgOps } from "../damage_types"
import { Data } from "../data/data_objects"
import { Event } from "../events/events"
import { EventInventory } from "../events/inventory_events"
import { geom } from "../geom"
import { ItemSystem } from "../items/system"
import { Convert } from "../systems_communication"
import { Accuracy } from "./battle_calcs"
import { Battle } from "./classes/battle"
import { BattleEvent } from "./events"
import { BattleTriggers } from "./TRIGGERS"
import { BattleActionExecution, BattleActionExecutionPosition, BattleActionExecutionTarget, BattleApCost, BattleApCostPosition, BattleApCostTarget, BattleNumber, BattleNumberTarget } from "./TYPES"
import { BattleValues } from "./VALUES"
import { action_points, ActionPositionKeys, ActionSelfKeys, ActionUnitKeys, battle_position } from "@custom_types/battle_data"

function attack_ap_cost(base: number, character: Character) {
    let result = base

    let weapon = character.equip.data.slots.weapon
    if (weapon != undefined) {
        result = base * ItemSystem.weight(weapon) / 4
    }

    const skill = CharacterSystem.attack_skill(character)
    result = result * (1 - skill / 200)
    const power = CharacterSystem.phys_power(character)
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
                Alerts.battle_event_simple(battle, 'flee', character, 3)
                Alerts.battle_event_simple(battle, 'update', character, 0)
                BattleEvent.Leave(battle, character)
                return
            }
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
            return CharacterSystem.movement_cost_battle(character) * RANDOM_STEP_LENGTH as action_points
        },
        execute: (battle: Battle, character: Character, ) => {
            const phi = Math.random() * Math.PI * 2
            const shift = {x: Math.cos(phi), y: Math.sin(phi)} as battle_position
            const target = geom.sum(character.position, geom.mult(shift, RANDOM_STEP_LENGTH))
            BattleEvent.Move(battle, character, target, true)
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
            return character.range()
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let dodge_flag = (target_character.dodge_turns > 0)
            let a = character.position
            let b = target_character.position
            let c = geom.minus(b, a)
            let norm = geom.norm(c)
            let power_ratio = CharacterSystem.phys_power(character) / CharacterSystem.phys_power(target_character)
            let scale = character.range() * power_ratio / norm
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
            return character.range()
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let dodge_flag = (target_character.dodge_turns > 0)
            let range = character.range()

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

                Alerts.battle_event_target_unit(battle, 'attack', character, aoe_target, 0)
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
            return character.range()
        },
        execute: (battle: Battle, character: Character,  target_character: Character, ) => {
            let dodge_flag = (target_character.dodge_turns > 0)
            let range = character.range()

            Event.attack(character, target_character, dodge_flag, 'blunt', false)
            Alerts.battle_event_target_unit(battle, 'attack', character, target_character, 0)
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
            const range = character.range()
            const max_move = character.action_points_left / BattleValues.move_cost(character) - 0.01 // potential movement

            if (dist < range) {
                return 0 as action_points
            }
            let distance_to_walk = Math.min(dist - range + 0.01, max_move)
            // console.log('ap cost to move close is ' + distance_to_walk * BattleValues.move_cost(character))
            // console.log('current ap:' + character.action_points_left)
            return distance_to_walk * BattleValues.move_cost(character) as action_points
        },
        execute: (battle: Battle, character: Character, target_character: Character, ignore_flag?: boolean) => {
            const delta = geom.minus(target_character.position, character.position);
            const dist = geom.norm(delta)
            const range = character.range()
            const max_move = character.action_points_left / BattleValues.move_cost(character) // potential movement
            if (dist < range) {
                return
            }
            let direction = geom.normalize(delta)
            let distance_to_walk = Math.min(dist - range + 0.01, max_move)
            let target = geom.sum(character.position, geom.mult(direction, distance_to_walk))
            BattleEvent.Move(battle, character, target, ignore_flag == true)
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
        ap_cost: (battle: Battle, character: Character,  target: battle_position) => {
            const distance = geom.dist(character.position, target)
            return Math.min(distance * BattleValues.move_cost(character), character.action_points_left) as action_points
        },
        execute: (battle: Battle, character: Character,  target: battle_position) => {
            BattleEvent.Move(battle, character, target, false)
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

export function battle_action_self_check(tag: string, battle: Battle, character: Character,  d_ap: action_points):BattleActionResponse {
    const action = ActionsSelf[tag as ActionSelfKeys]
    if (action == undefined) {
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character)
    if (character.action_points_left + d_ap < ap_cost) {
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: character.action_points_left}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

export function battle_action_character_check(
    tag: string,
    battle: Battle,
    character: Character,
    target_character: Character,
    d_distance: number, d_ap: number) : BattleActionUnitResponse
{
    const action = ActionsUnit[tag as ActionUnitKeys]
    if (action == undefined) {
        // console.log('no such key')
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character, target_character)
    if (character.action_points_left + d_ap < ap_cost) {
        // console.log('not enough ap', ap_cost, character.action_points_left, d_ap)
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: character.action_points_left}
    }

    const range = action.range(battle, character)
    const dist = geom.dist(character.position, target_character.position)
    if (range + d_distance < dist) {
        // console.log('not enough range', range, dist, d_distance)
        return {response: "NOT_ENOUGH_RANGE"}
    }

    if (!action.valid(character)) {
        // console.log('character is not valid')
        return {response: "ATTEMPT_IS_INVALID"}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

export function battle_action_position_check(tag: string, battle: Battle, character: Character,  target: battle_position): BattleActionPositionResponse {
    const action = ActionsPosition[tag as ActionPositionKeys]
    if (action == undefined) {
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character, target)
    if ((character.action_points_left < ap_cost - 0.01) || (character.action_points_left == 0)) {
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: character.action_points_left}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

export function battle_action_self(tag: string, battle: Battle, character: Character, ): BattleActionResponse {
    let result = battle_action_self_check(tag, battle, character, 0 as action_points)
    if (result.response == "OK") {
        character.action_points_left = character.action_points_left - result.ap_cost as action_points
        result.action.execute(battle, character)
    }
    return result
}

export function battle_action_character(tag: ActionUnitKeys, battle: Battle, character: Character,  target_character: Character, ) {
    let result = battle_action_character_check(tag, battle, character, target_character, 0, 0)
    // console.log(character.get_name(), 'attempts to ', tag, 'to', target_character.get_name())
    // console.log(result.response)
    if (result.response == "OK") {
        result.action.execute(battle, character, target_character)
        character.action_points_left = character.action_points_left - result.ap_cost as action_points
        // Alerts.battle_event(battle, tag, character.id, target_character.position, target_character.id, result.ap_cost)
        Alerts.battle_update_unit(battle, character)
        Alerts.battle_update_unit(battle, target_character)
        // Alerts.battle_event_simple(battle, tag, character, result.ap_cost)
    }
    return result
}

export function battle_action_position(tag: ActionPositionKeys, battle: Battle, character: Character,  target: battle_position) {
    let result = battle_action_position_check(tag, battle, character, target)
    console.log(character.get_name(), 'attempts to ', tag)
    console.log(result.response)
    if (result.response == "OK") {
        result.action.execute(battle, character, target)
        character.action_points_left = character.action_points_left - result.ap_cost as action_points

        if (character.action_points_left < 0) {
            character.action_points_left = 0 as action_points
        }
    }
    return result
}