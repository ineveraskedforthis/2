"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.battle_action_unit = exports.battle_action_self = exports.ActionsPosition = exports.ActionsUnit = exports.ActionsSelf = void 0;
const system_1 = require("../attack/system");
const system_2 = require("../character/system");
const alerts_1 = require("../client_communication/network_actions/alerts");
const damage_types_1 = require("../damage_types");
const events_1 = require("../events/events");
const geom_1 = require("../geom");
const systems_communication_1 = require("../systems_communication");
const events_2 = require("./events");
const TRIGGERS_1 = require("./TRIGGERS");
const VALUES_1 = require("./VALUES");
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
        }
    },
    "EndTurn": {
        ap_cost: (battle, character, unit) => {
            return 0;
        },
        execute: (battle, character, unit) => {
            events_2.BattleEvent.EndTurn(battle, unit);
        }
    }
};
exports.ActionsUnit = {
    'Pierce': {
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return 2;
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
            events_1.Event.attack(character, target_character, dodge_flag, 'pierce');
        },
        damage: (battle, character, unit) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'pierce').damage);
        },
    },
    'Slash': {
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return 3;
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
                events_1.Event.attack(character, damaged_character, dodge_flag, 'slice');
                alerts_1.Alerts.battle_event_target_unit(battle, 'attack', unit, aoe_target, 0);
                alerts_1.Alerts.battle_update_unit(battle, aoe_target);
            }
        },
        damage: (battle, character, unit) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'slice').damage);
        },
    },
    'Knock': {
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return 3;
        },
        range: (battle, character, unit) => {
            return character.range();
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            let dodge_flag = (target_unit.dodge_turns > 0);
            let range = character.range();
            events_1.Event.attack(character, target_character, dodge_flag, 'blunt');
            alerts_1.Alerts.battle_event_target_unit(battle, 'attack', unit, target_unit, 0);
            alerts_1.Alerts.battle_update_unit(battle, unit);
            alerts_1.Alerts.battle_update_unit(battle, target_unit);
        },
        damage: (battle, character, unit) => {
            return damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'blunt').damage);
        },
    },
};
exports.ActionsPosition = {};
const action_currrent = exports.ActionsSelf.Flee;
function battle_action_self_check(tag, battle, character, unit) {
    const action = exports.ActionsSelf[tag];
    if (action == undefined) {
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character, unit);
    if (unit.action_points_left < ap_cost) {
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
function battle_action_unit_check(tag, battle, character, unit, target_character, target_unit) {
    const action = exports.ActionsUnit[tag];
    if (action == undefined) {
        return { response: "INVALID_ACTION" };
    }
    const ap_cost = action.ap_cost(battle, character, unit, target_character, target_unit);
    if (unit.action_points_left < ap_cost) {
        return { response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left };
    }
    const range = action.range(battle, character, unit);
    const dist = geom_1.geom.dist(unit.position, target_unit.position);
    if (range < dist) {
        return { response: "NOT_ENOUGH_RANGE" };
    }
    return { response: "OK", ap_cost: ap_cost, action: action };
}
function battle_action_self(tag, battle, character, unit) {
    let result = battle_action_self_check(tag, battle, character, unit);
    if (result.response == "OK") {
        unit.action_points_left = unit.action_points_left - result.ap_cost;
        result.action.execute(battle, character, unit);
    }
    return result;
}
exports.battle_action_self = battle_action_self;
function battle_action_unit(tag, battle, character, unit, target_character, target_unit) {
    let result = battle_action_unit_check(tag, battle, character, unit, target_character, target_unit);
    if (result.response == "OK") {
        unit.action_points_left = unit.action_points_left - result.ap_cost;
        result.action.execute(battle, character, unit, target_character, target_unit);
        // Alerts.battle_event(battle, tag, unit.id, target_unit.position, target_unit.id, result.ap_cost)
        alerts_1.Alerts.battle_update_unit(battle, unit);
        alerts_1.Alerts.battle_update_unit(battle, target_unit);
    }
    return result;
}
exports.battle_action_unit = battle_action_unit;
