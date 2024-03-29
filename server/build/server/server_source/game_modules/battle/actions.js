"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.battle_action_position = exports.battle_action_unit = exports.battle_action_self = exports.battle_action_position_check = exports.battle_action_unit_check = exports.battle_action_self_check = exports.ActionsPosition = exports.ActionsUnit = exports.ActionsSelf = void 0;
const system_1 = require("../attack/system");
const checks_1 = require("../character/checks");
const system_2 = require("../character/system");
const alerts_1 = require("../client_communication/network_actions/alerts");
const damage_types_1 = require("../damage_types");
const events_1 = require("../events/events");
const inventory_events_1 = require("../events/inventory_events");
const geom_1 = require("../geom");
const system_3 = require("../items/system");
const systems_communication_1 = require("../systems_communication");
const battle_calcs_1 = require("./battle_calcs");
const events_2 = require("./events");
const TRIGGERS_1 = require("./TRIGGERS");
const VALUES_1 = require("./VALUES");
function attack_ap_cost(base, character) {
    let result = base;
    let weapon = character.equip.data.slots.weapon;
    if (weapon != undefined) {
        result = base * system_3.ItemSystem.weight(weapon) / 4;
    }
    const skill = system_2.CharacterSystem.attack_skill(character);
    result = result * (1 - skill / 200);
    const power = system_2.CharacterSystem.phys_power(character);
    result = result * (0.5 + 10 / power);
    return result;
}
function always(character) {
    return true;
}
const RANDOM_STEP_LENGTH = 2;
exports.ActionsSelf = {
    "Flee": {
        ap_cost: (battle, character, unit) => {
            return 3;
        },
        execute: (battle, character, unit) => {
            if (TRIGGERS_1.BattleTriggers.safe(battle)) {
                events_2.BattleEvent.Leave(battle, unit);
                return;
            }
            let dice = Math.random();
            if (dice <= VALUES_1.BattleValues.flee_chance(unit.position)) { // success
                alerts_1.Alerts.battle_event_simple(battle, 'flee', unit, 3);
                alerts_1.Alerts.battle_event_simple(battle, 'update', unit, 0);
                events_2.BattleEvent.Leave(battle, unit);
                return;
            }
        },
        chance: (battle, character, unit) => {
            return VALUES_1.BattleValues.flee_chance(unit.position);
        }
    },
    "EndTurn": {
        ap_cost: (battle, character, unit) => {
            return 0;
        },
        execute: (battle, character, unit) => {
            events_2.BattleEvent.EndTurn(battle, unit);
        },
        chance: (battle, character, unit) => {
            return 1;
        }
    },
    'RandomStep': {
        // max_utility: 2,
        ap_cost: (battle, character, unit) => {
            return system_2.CharacterSystem.movement_cost_battle(character) * RANDOM_STEP_LENGTH;
        },
        execute: (battle, character, unit) => {
            const phi = Math.random() * Math.PI * 2;
            const shift = { x: Math.cos(phi), y: Math.sin(phi) };
            const target = geom_1.geom.sum(unit.position, geom_1.geom.mult(shift, RANDOM_STEP_LENGTH));
            events_2.BattleEvent.Move(battle, unit, character, target, true);
        },
        chance: (battle, character, unit) => {
            return 1;
        }
    },
};
exports.ActionsUnit = {
    'Pierce': {
        valid: always,
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return attack_ap_cost(2, character);
        },
        range: (battle, character, unit) => {
            return character.range();
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let dodge_flag = (target_unit.dodge_turns > 0);
            let a = unit.position;
            let b = target_unit.position;
            let c = geom_1.geom.minus(b, a);
            let norm = geom_1.geom.norm(c);
            let power_ratio = system_2.CharacterSystem.phys_power(character) / system_2.CharacterSystem.phys_power(target_character);
            let scale = character.range() * power_ratio / norm;
            c = geom_1.geom.mult(c, scale);
            events_2.BattleEvent.SetCoord(battle, target_unit, geom_1.geom.sum(b, c));
            events_1.Event.attack(character, target_character, dodge_flag, 'pierce', false);
        },
        damage: (battle, character, unit) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'pierce').damage);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        }
    },
    'Slash': {
        valid: always,
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return attack_ap_cost(3, character);
        },
        range: (battle, character, unit) => {
            return character.range();
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let dodge_flag = (target_unit.dodge_turns > 0);
            let range = character.range();
            for (let aoe_target of Object.values(battle.heap.data)) {
                if (unit.id == aoe_target.id)
                    continue;
                if (geom_1.geom.dist(unit.position, aoe_target.position) > range)
                    continue;
                let damaged_character = systems_communication_1.Convert.unit_to_character(aoe_target);
                if (unit.team == aoe_target.team)
                    continue;
                if (target_unit.id != aoe_target.id) {
                    events_1.Event.attack(character, damaged_character, dodge_flag, 'slice', true);
                }
                else {
                    events_1.Event.attack(character, damaged_character, dodge_flag, 'slice', false);
                }
                alerts_1.Alerts.battle_event_target_unit(battle, 'attack', unit, aoe_target, 0);
                alerts_1.Alerts.battle_update_unit(battle, aoe_target);
            }
        },
        damage: (battle, character, unit) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'slice').damage);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        }
    },
    'Knock': {
        valid: always,
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return attack_ap_cost(2, character);
        },
        range: (battle, character, unit) => {
            return character.range();
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let dodge_flag = (target_unit.dodge_turns > 0);
            let range = character.range();
            events_1.Event.attack(character, target_character, dodge_flag, 'blunt', false);
            alerts_1.Alerts.battle_event_target_unit(battle, 'attack', unit, target_unit, 0);
            alerts_1.Alerts.battle_update_unit(battle, unit);
            alerts_1.Alerts.battle_update_unit(battle, target_unit);
        },
        damage: (battle, character, unit) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'blunt').damage);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        }
    },
    'Ranged': {
        valid: checks_1.can_shoot,
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return 3;
        },
        range: (battle, character, unit) => {
            return 9999;
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let dist = geom_1.geom.dist(unit.position, target_unit.position);
            events_1.Event.shoot(character, target_character, dist, target_unit.dodge_turns > 0);
        },
        damage: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            const acc = battle_calcs_1.Accuracy.ranged(character, distance);
            const attack = system_1.Attack.generate_ranged(character);
            return damage_types_1.DmgOps.total(attack.damage) * acc;
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            const acc = battle_calcs_1.Accuracy.ranged(character, distance);
            return acc;
        }
    },
    "MagicBolt": {
        valid: checks_1.can_cast_magic_bolt,
        range: (battle, character, unit) => {
            return 999;
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            events_1.Event.magic_bolt_mage(character, target_character, distance, target_unit.dodge_turns > 0);
        },
        damage: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            return damage_types_1.DmgOps.total(system_1.Attack.generate_magic_bolt(character, distance, false).damage);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return 1.5;
        }
    },
    "MagicBoltBlood": {
        valid: checks_1.can_cast_magic_bolt_blood,
        range: (battle, character, unit) => {
            return 999;
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            events_1.Event.magic_bolt_blood(character, target_character, distance, target_unit.dodge_turns > 0);
        },
        damage: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            return damage_types_1.DmgOps.total(system_1.Attack.generate_magic_bolt(character, distance, true).damage);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return 2;
        }
    },
    "MagicBoltZAZ": {
        valid: checks_1.has_zaz,
        range: (battle, character, unit) => {
            return 999;
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            events_1.Event.magic_bolt_zaz(character, target_character, distance, target_unit.dodge_turns > 0);
        },
        damage: (battle, character, unit, target_character, target_unit) => {
            let distance = geom_1.geom.dist(unit.position, target_unit.position);
            return damage_types_1.DmgOps.total(system_1.Attack.generate_magic_bolt(character, distance, true).damage);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return 3;
        }
    },
    "MoveTowards": {
        valid: always,
        range: (battle, character, unit) => {
            return 100;
        },
        damage: (battle, character, unit) => {
            return 0;
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            const delta = geom_1.geom.minus(target_unit.position, unit.position);
            const dist = geom_1.geom.norm(delta);
            const range = character.range();
            const max_move = unit.action_points_left / VALUES_1.BattleValues.move_cost(unit, character) - 0.01; // potential movement
            if (dist < range) {
                return 0;
            }
            let distance_to_walk = Math.min(dist - range + 0.01, max_move);
            // console.log('ap cost to move close is ' + distance_to_walk * BattleValues.move_cost(unit, character))
            // console.log('current ap:' + unit.action_points_left)
            return distance_to_walk * VALUES_1.BattleValues.move_cost(unit, character);
        },
        execute: (battle, character, unit, target_character, target_unit, ignore_flag) => {
            const delta = geom_1.geom.minus(target_unit.position, unit.position);
            const dist = geom_1.geom.norm(delta);
            const range = character.range();
            const max_move = unit.action_points_left / VALUES_1.BattleValues.move_cost(unit, character); // potential movement
            if (dist < range) {
                return;
            }
            let direction = geom_1.geom.normalize(delta);
            let distance_to_walk = Math.min(dist - range + 0.01, max_move);
            let target = geom_1.geom.sum(unit.position, geom_1.geom.mult(direction, distance_to_walk));
            events_2.BattleEvent.Move(battle, unit, character, target, ignore_flag == true);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        },
        move_closer: true
    },
    "SwitchWeapon": {
        valid: always,
        range: (battle, character, unit) => {
            return 9999;
        },
        ap_cost: (battle, character, unit) => {
            return 0;
        },
        damage: (battle, character, unit) => {
            return 0;
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            inventory_events_1.EventInventory.switch_weapon(character);
        },
        chance: (battle, character, unit, target_character, target_unit) => {
            return 1;
        },
        switch_weapon: true
    }
};
exports.ActionsPosition = {
    'Move': {
        ap_cost: (battle, character, unit, target) => {
            const distance = geom_1.geom.dist(unit.position, target);
            return Math.min(distance * VALUES_1.BattleValues.move_cost(unit, character), unit.action_points_left);
        },
        execute: (battle, character, unit, target) => {
            events_2.BattleEvent.Move(battle, unit, character, target, false);
        }
    }
};
const action_currrent = exports.ActionsSelf.Flee;
function battle_action_self_check(tag, battle, character, unit, d_ap) {
    const action = exports.ActionsSelf[tag];
    if (action == undefined) {
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character, unit);
    if (unit.action_points_left + d_ap < ap_cost) {
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
exports.battle_action_self_check = battle_action_self_check;
function battle_action_unit_check(tag, battle, character, unit, target_character, target_unit, d_distance, d_ap) {
    const action = exports.ActionsUnit[tag];
    if (action == undefined) {
        // console.log('no such key')
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character, unit, target_character, target_unit);
    if (unit.action_points_left + d_ap < ap_cost) {
        // console.log('not enough ap', ap_cost, unit.action_points_left, d_ap)
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left };
    }
    const range = action.range(battle, character, unit);
    const dist = geom_1.geom.dist(unit.position, target_unit.position);
    if (range + d_distance < dist) {
        // console.log('not enough range', range, dist, d_distance)
        return { response: "NOT_ENOUGH_RANGE" };
    }
    if (!action.valid(character)) {
        // console.log('character is not valid')
        return { response: "ATTEMPT_IS_INVALID" };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
exports.battle_action_unit_check = battle_action_unit_check;
function battle_action_position_check(tag, battle, character, unit, target) {
    const action = exports.ActionsPosition[tag];
    if (action == undefined) {
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character, unit, target);
    if ((unit.action_points_left < ap_cost - 0.01) || (unit.action_points_left == 0)) {
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
exports.battle_action_position_check = battle_action_position_check;
function battle_action_self(tag, battle, character, unit) {
    let result = battle_action_self_check(tag, battle, character, unit, 0);
    if (result.response == "OK") {
        unit.action_points_left = unit.action_points_left - result.ap_cost;
        result.action.execute(battle, character, unit);
    }
    return result;
}
exports.battle_action_self = battle_action_self;
function battle_action_unit(tag, battle, character, unit, target_character, target_unit) {
    let result = battle_action_unit_check(tag, battle, character, unit, target_character, target_unit, 0, 0);
    // console.log(character.get_name(), 'attempts to ', tag, 'to', target_character.get_name())
    // console.log(result.response)
    if (result.response == "OK") {
        result.action.execute(battle, character, unit, target_character, target_unit);
        unit.action_points_left = unit.action_points_left - result.ap_cost;
        // Alerts.battle_event(battle, tag, unit.id, target_unit.position, target_unit.id, result.ap_cost)
        alerts_1.Alerts.battle_update_unit(battle, unit);
        alerts_1.Alerts.battle_update_unit(battle, target_unit);
        // Alerts.battle_event_simple(battle, tag, unit, result.ap_cost)
    }
    return result;
}
exports.battle_action_unit = battle_action_unit;
function battle_action_position(tag, battle, character, unit, target) {
    let result = battle_action_position_check(tag, battle, character, unit, target);
    console.log(character.get_name(), 'attempts to ', tag);
    console.log(result.response);
    if (result.response == "OK") {
        result.action.execute(battle, character, unit, target);
        unit.action_points_left = unit.action_points_left - result.ap_cost;
        if (unit.action_points_left < 0) {
            unit.action_points_left = 0;
        }
    }
    return result;
}
exports.battle_action_position = battle_action_position;
