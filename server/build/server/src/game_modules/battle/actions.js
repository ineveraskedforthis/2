"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.battle_action_position = exports.battle_action_character = exports.battle_action_self = exports.battle_action_position_check = exports.battle_action_character_check = exports.battle_action_self_check = exports.ActionsPosition = exports.ActionsUnit = exports.ActionsSelf = void 0;
const system_1 = require("../attack/system");
const checks_1 = require("../character/checks");
const alerts_1 = require("../client_communication/network_actions/alerts");
const damage_types_1 = require("../damage_types");
const data_objects_1 = require("../data/data_objects");
const events_1 = require("../events/events");
const inventory_events_1 = require("../events/inventory_events");
const geom_1 = require("../geom");
const item_system_1 = require("../systems/items/item_system");
const battle_calcs_1 = require("./battle_calcs");
const events_2 = require("./events");
const TRIGGERS_1 = require("./TRIGGERS");
const VALUES_1 = require("./VALUES");
const equipment_values_1 = require("../scripted-values/equipment-values");
const character_1 = require("../scripted-values/character");
function attack_ap_cost(base, character) {
    let result = base;
    let weapon = equipment_values_1.EquipmentValues.weapon(character.equip);
    if (weapon != undefined) {
        result = base * item_system_1.ItemSystem.weight(weapon) / 4;
    }
    const skill = character_1.CharacterValues.attack_skill(character);
    result = result * (1 - skill / 200);
    const power = character_1.CharacterValues.phys_power(character);
    result = result * (0.5 + 10 / power);
    return result;
}
function always(character) {
    return true;
}
const RANDOM_STEP_LENGTH = 2;
exports.ActionsSelf = {
    "Flee": {
        ap_cost: (battle, character) => {
            return 3;
        },
        execute: (battle, character) => {
            if (TRIGGERS_1.BattleTriggers.safe(battle)) {
                events_2.BattleEvent.Leave(battle, character);
                return;
            }
            let dice = Math.random();
            if (dice <= VALUES_1.BattleValues.flee_chance(character.position)) { // success
                alerts_1.Alerts.battle_event_simple(battle, 'flee', character);
                alerts_1.Alerts.battle_event_simple(battle, 'update', character);
                events_2.BattleEvent.Leave(battle, character);
                return;
            }
            alerts_1.Alerts.battle_event_simple(battle, "flee", character);
        },
        chance: (battle, character) => {
            return VALUES_1.BattleValues.flee_chance(character.position);
        }
    },
    "EndTurn": {
        ap_cost: (battle, character) => {
            return 0;
        },
        execute: (battle, character) => {
            events_2.BattleEvent.EndTurn(battle, character);
        },
        chance: (battle, character) => {
            return 1;
        }
    },
    'RandomStep': {
        // max_utility: 2,
        ap_cost: (battle, character) => {
            return character_1.CharacterValues.movement_cost_battle(character) * RANDOM_STEP_LENGTH;
        },
        execute: (battle, character, available_points) => {
            const phi = Math.random() * Math.PI * 2;
            const shift = { x: Math.cos(phi), y: Math.sin(phi) };
            let target = geom_1.geom.sum(character.position, geom_1.geom.mult(shift, RANDOM_STEP_LENGTH));
            events_2.BattleEvent.Move(battle, character, target, available_points, false);
        },
        chance: (battle, character) => {
            return 1;
        }
    },
};
exports.ActionsUnit = {
    'Pierce': {
        valid: always,
        ap_cost: (battle, character, target_character) => {
            return attack_ap_cost(2, character);
        },
        range: (battle, character) => {
            return character_1.CharacterValues.range(character);
        },
        execute: (battle, character, target_character) => {
            let dodge_flag = (target_character.dodge_turns > 0);
            let a = character.position;
            let b = target_character.position;
            let c = geom_1.geom.minus(b, a);
            let norm = geom_1.geom.norm(c);
            let power_ratio = character_1.CharacterValues.phys_power(character) / character_1.CharacterValues.phys_power(target_character);
            let scale = character_1.CharacterValues.range(character) * power_ratio / norm;
            c = geom_1.geom.mult(c, scale);
            events_2.BattleEvent.SetCoord(battle, target_character, geom_1.geom.sum(b, c));
            events_1.Event.attack(character, target_character, dodge_flag, 'pierce', false);
        },
        damage: (battle, character) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'pierce').damage);
        },
        chance: (battle, character, target_character) => {
            return 1;
        }
    },
    'Slash': {
        valid: always,
        ap_cost: (battle, character, target_character) => {
            return attack_ap_cost(3, character);
        },
        range: (battle, character) => {
            return character_1.CharacterValues.range(character);
        },
        execute: (battle, character, target_character) => {
            let dodge_flag = (target_character.dodge_turns > 0);
            let range = character_1.CharacterValues.range(character);
            for (let aoe_target_id of battle.heap) {
                const aoe_target = data_objects_1.Data.Characters.from_id(aoe_target_id);
                if (aoe_target == undefined)
                    continue;
                if (character.id == aoe_target.id)
                    continue;
                if (geom_1.geom.dist(character.position, aoe_target.position) > range)
                    continue;
                if (character.team == aoe_target.team)
                    continue;
                if (target_character.id != aoe_target.id) {
                    events_1.Event.attack(character, aoe_target, dodge_flag, 'slice', true);
                }
                else {
                    events_1.Event.attack(character, aoe_target, dodge_flag, 'slice', false);
                }
                alerts_1.Alerts.battle_event_target_unit(battle, 'attack', character, aoe_target);
                alerts_1.Alerts.battle_update_unit(battle, aoe_target);
            }
        },
        damage: (battle, character) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'slice').damage);
        },
        chance: (battle, character, target_character) => {
            return 1;
        }
    },
    'Knock': {
        valid: always,
        ap_cost: (battle, character, target_character) => {
            return attack_ap_cost(2, character);
        },
        range: (battle, character) => {
            return character_1.CharacterValues.range(character);
        },
        execute: (battle, character, target_character) => {
            let dodge_flag = (target_character.dodge_turns > 0);
            let range = character_1.CharacterValues.range(character);
            events_1.Event.attack(character, target_character, dodge_flag, 'blunt', false);
            alerts_1.Alerts.battle_event_target_unit(battle, 'attack', character, target_character);
            alerts_1.Alerts.battle_update_unit(battle, character);
            alerts_1.Alerts.battle_update_unit(battle, target_character);
        },
        damage: (battle, character) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'blunt').damage);
        },
        chance: (battle, character, target_character) => {
            return 1;
        }
    },
    'Ranged': {
        valid: checks_1.can_shoot,
        ap_cost: (battle, character, target_character) => {
            return 3;
        },
        range: (battle, character) => {
            return 9999;
        },
        execute: (battle, character, target_character) => {
            let dist = geom_1.geom.dist(character.position, target_character.position);
            events_1.Event.shoot(character, target_character, dist, target_character.dodge_turns > 0);
        },
        damage: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            const acc = battle_calcs_1.Accuracy.ranged(character, distance);
            const attack = system_1.Attack.generate_ranged(character);
            return damage_types_1.DmgOps.total(attack.damage) * acc;
        },
        chance: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            const acc = battle_calcs_1.Accuracy.ranged(character, distance);
            return acc;
        }
    },
    "MagicBolt": {
        valid: checks_1.can_cast_magic_bolt,
        range: (battle, character) => {
            return 999;
        },
        execute: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            events_1.Event.magic_bolt_mage(character, target_character, distance, target_character.dodge_turns > 0);
        },
        damage: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            return damage_types_1.DmgOps.total(system_1.Attack.generate_magic_bolt(character, distance, false).damage);
        },
        chance: (battle, character, target_character) => {
            return 1;
        },
        ap_cost: (battle, character, target_character) => {
            return 1.5;
        }
    },
    "MagicBoltBlood": {
        valid: checks_1.can_cast_magic_bolt_blood,
        range: (battle, character) => {
            return 999;
        },
        execute: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            events_1.Event.magic_bolt_blood(character, target_character, distance, target_character.dodge_turns > 0);
        },
        damage: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            return damage_types_1.DmgOps.total(system_1.Attack.generate_magic_bolt(character, distance, true).damage);
        },
        chance: (battle, character, target_character) => {
            return 1;
        },
        ap_cost: (battle, character, target_character) => {
            return 2;
        }
    },
    "MagicBoltZAZ": {
        valid: checks_1.has_zaz,
        range: (battle, character) => {
            return 999;
        },
        execute: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            events_1.Event.magic_bolt_zaz(character, target_character, distance, target_character.dodge_turns > 0);
        },
        damage: (battle, character, target_character) => {
            let distance = geom_1.geom.dist(character.position, target_character.position);
            return damage_types_1.DmgOps.total(system_1.Attack.generate_magic_bolt(character, distance, true).damage);
        },
        chance: (battle, character, target_character) => {
            return 1;
        },
        ap_cost: (battle, character, target_character) => {
            return 3;
        }
    },
    "MoveTowards": {
        valid: always,
        range: (battle, character) => {
            return 100;
        },
        damage: (battle, character) => {
            return 0;
        },
        ap_cost: (battle, character, target_character) => {
            const delta = geom_1.geom.minus(target_character.position, character.position);
            const dist = geom_1.geom.norm(delta);
            const range = character_1.CharacterValues.range(character);
            const max_move = character.action_points_left / VALUES_1.BattleValues.move_cost(character) - 0.01; // potential movement
            if (dist < range) {
                return 0;
            }
            let distance_to_walk = Math.min(dist - range + 0.01, max_move);
            // console.log('ap cost to move close is ' + distance_to_walk * BattleValues.move_cost(character))
            // console.log('current ap:' + character.action_points_left)
            return distance_to_walk * VALUES_1.BattleValues.move_cost(character);
        },
        execute: (battle, character, target_character, available_points) => {
            const delta = geom_1.geom.minus(target_character.position, character.position);
            const dist = geom_1.geom.norm(delta);
            const range = character_1.CharacterValues.range(character);
            const max_move = available_points / VALUES_1.BattleValues.move_cost(character); // potential movement
            if (dist < range) {
                return;
            }
            let direction = geom_1.geom.normalize(delta);
            let distance_to_walk = Math.min(dist - range + 0.01, max_move);
            let target = geom_1.geom.sum(character.position, geom_1.geom.mult(direction, distance_to_walk));
            events_2.BattleEvent.Move(battle, character, target, available_points, false);
        },
        chance: (battle, character, target_character) => {
            return 1;
        },
        move_closer: true
    },
    "SwitchWeapon": {
        valid: always,
        range: (battle, character) => {
            return 9999;
        },
        ap_cost: (battle, character) => {
            return 0;
        },
        damage: (battle, character) => {
            return 0;
        },
        execute: (battle, character, target_character) => {
            inventory_events_1.EventInventory.switch_weapon(character);
        },
        chance: (battle, character, target_character) => {
            return 1;
        },
        switch_weapon: true
    }
};
exports.ActionsPosition = {
    'Move': {
        ap_cost: (battle, character, target) => {
            const distance = geom_1.geom.dist(character.position, target);
            return Math.min(distance * VALUES_1.BattleValues.move_cost(character), character.action_points_left);
        },
        execute: (battle, character, target, available_points) => {
            events_2.BattleEvent.Move(battle, character, target, available_points, false);
        }
    }
};
const action_currrent = exports.ActionsSelf.Flee;
function response_to_alert(character, response) {
    switch (response.response) {
        case "NOT_ENOUGH_AP": {
            alerts_1.Alerts.alert(character, "Not enough action points.");
            return;
        }
        case "INVALID_ACTION": {
            alerts_1.Alerts.alert(character, "You are trying to do an undefined action.");
            return;
        }
        case "OK": {
            return;
        }
        case "NOT_ENOUGH_RANGE": {
            alerts_1.Alerts.alert(character, "You are too far away.");
            return;
        }
        case "ATTEMPT_IS_INVALID":
            {
                alerts_1.Alerts.alert(character, "You can't do this action.");
                return;
            }
            ;
    }
}
function battle_action_self_check(tag, battle, character, d_ap) {
    const action = exports.ActionsSelf[tag];
    if (action == undefined) {
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character);
    if (character.action_points_left + d_ap < ap_cost) {
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: character.action_points_left };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
exports.battle_action_self_check = battle_action_self_check;
function battle_action_character_check(tag, battle, character, target_character, d_distance, d_ap) {
    const action = exports.ActionsUnit[tag];
    if (action == undefined) {
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character, target_character);
    if (character.action_points_left + d_ap < ap_cost) {
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: character.action_points_left };
    }
    const range = action.range(battle, character);
    const dist = geom_1.geom.dist(character.position, target_character.position);
    if (range + d_distance < dist) {
        return { response: "NOT_ENOUGH_RANGE" };
    }
    if (!action.valid(character)) {
        return { response: "ATTEMPT_IS_INVALID" };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
exports.battle_action_character_check = battle_action_character_check;
function battle_action_position_check(tag, battle, character, target) {
    const action = exports.ActionsPosition[tag];
    if (action == undefined) {
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character, target);
    if ((character.action_points_left < ap_cost - 0.01) || (character.action_points_left == 0)) {
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: character.action_points_left };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
exports.battle_action_position_check = battle_action_position_check;
function battle_action_self(tag, battle, character) {
    let result = battle_action_self_check(tag, battle, character, 0);
    if (result.response == "OK") {
        character.action_points_left = character.action_points_left - result.ap_cost;
        result.action.execute(battle, character, result.ap_cost);
    }
    response_to_alert(character, result);
    return result;
}
exports.battle_action_self = battle_action_self;
function battle_action_character(tag, battle, character, target_character) {
    let result = battle_action_character_check(tag, battle, character, target_character, 0, 0);
    console.log(character.get_name(), 'attempts to ', tag, 'to', target_character.get_name());
    console.log(result.response);
    if (result.response == "OK") {
        character.action_points_left = character.action_points_left - result.ap_cost;
        result.action.execute(battle, character, target_character, result.ap_cost);
        alerts_1.Alerts.battle_update_unit(battle, character);
        alerts_1.Alerts.battle_update_unit(battle, target_character);
    }
    response_to_alert(character, result);
    return result;
}
exports.battle_action_character = battle_action_character;
function battle_action_position(tag, battle, character, target) {
    let result = battle_action_position_check(tag, battle, character, target);
    console.log(character.get_name(), 'attempts to ', tag);
    console.log(result.response);
    if (result.response == "OK") {
        character.action_points_left = character.action_points_left - result.ap_cost;
        result.action.execute(battle, character, target, result.ap_cost);
        if (character.action_points_left < 0) {
            character.action_points_left = 0;
        }
    }
    response_to_alert(character, result);
    return result;
}
exports.battle_action_position = battle_action_position;
