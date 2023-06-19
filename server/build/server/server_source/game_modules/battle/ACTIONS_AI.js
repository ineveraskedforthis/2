"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleActionsPerUnitAI = exports.BattleActionsBasicAI = void 0;
const system_1 = require("../character/system");
const geom_1 = require("../geom");
const events_1 = require("./events");
const ACTIONS_1 = require("./ACTIONS");
const VALUES_1 = require("./VALUES");
const TRIGGERS_1 = require("./TRIGGERS");
const systems_communication_1 = require("../systems_communication");
const RANDOM_STEP_LENGTH = 2;
function always(character) {
    return true;
}
exports.BattleActionsBasicAI = {
    'RandomStep': {
        max_utility: 2,
        ap_cost: (battle, character, unit) => {
            return system_1.CharacterSystem.movement_cost_battle(character) * RANDOM_STEP_LENGTH;
        },
        execute: (battle, character, unit) => {
            const phi = Math.random() * Math.PI * 2;
            const shift = { x: Math.cos(phi), y: Math.sin(phi) };
            const target = geom_1.geom.sum(unit.position, geom_1.geom.mult(shift, RANDOM_STEP_LENGTH));
            events_1.BattleEvent.Move(battle, unit, character, target);
        },
        utility: (battle, character, unit) => {
            let total_utility = 0;
            for (const item of Object.values(battle.heap.data)) {
                let distance = geom_1.geom.dist(unit.position, item.position);
                if (item.id == unit.id)
                    continue;
                let target = systems_communication_1.Convert.unit_to_character(item);
                if (target.dead())
                    continue;
                if (distance < RANDOM_STEP_LENGTH)
                    total_utility += 1;
            }
            return total_utility;
        }
    },
    'Flee': {
        max_utility: 1,
        ap_cost: (battle, character, unit) => {
            return ACTIONS_1.ActionsSelf.Flee.ap_cost(battle, character, unit);
        },
        execute: (battle, character, unit) => {
            (0, ACTIONS_1.battle_action_self)('Flee', battle, character, unit);
        },
        utility: (battle, character, unit) => {
            if (battle.grace_period > 0) {
                return 0;
            }
            if (TRIGGERS_1.BattleTriggers.safe(battle)) {
                events_1.BattleEvent.Leave(battle, unit);
                return 1;
            }
            return (character.get_max_hp() - character.get_hp()) / character.get_max_hp() * VALUES_1.BattleValues.flee_chance(unit.position);
        }
    },
    'EndTurn': {
        max_utility: 1,
        ap_cost: (battle, character, unit) => {
            return ACTIONS_1.ActionsSelf.EndTurn.ap_cost(battle, character, unit);
        },
        execute: (battle, character, unit) => {
            (0, ACTIONS_1.battle_action_self)('EndTurn', battle, character, unit);
        },
        utility: (battle, character, unit) => {
            return 0.001;
        }
    }
};
exports.BattleActionsPerUnitAI = {
    "AttackPierce": {
        max_utility: 1,
        range: (battle, character, unit) => {
            return ACTIONS_1.ActionsUnit.Pierce.range(battle, character, unit);
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return ACTIONS_1.ActionsUnit.Pierce.ap_cost(battle, character, unit, target_character, target_unit);
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            ACTIONS_1.ActionsUnit.Pierce.execute(battle, character, unit, target_character, target_unit);
        },
        utility: (battle, character, unit, target_character, target_unit) => {
            if (target_character.dead())
                return 0;
            if (TRIGGERS_1.BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
                return 1 / geom_1.geom.dist(unit.position, target_unit.position) * ACTIONS_1.ActionsUnit.Pierce.damage(battle, character, unit);
            }
            return 0;
        },
    },
    "AttackSlash": {
        max_utility: 1,
        range: (battle, character, unit) => {
            return ACTIONS_1.ActionsUnit.Slash.range(battle, character, unit);
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return ACTIONS_1.ActionsUnit.Slash.ap_cost(battle, character, unit, target_character, target_unit);
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            ACTIONS_1.ActionsUnit.Slash.execute(battle, character, unit, target_character, target_unit);
        },
        utility: (battle, character, unit, target_character, target_unit) => {
            if (target_character.dead())
                return 0;
            if (TRIGGERS_1.BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
                return 1 / geom_1.geom.dist(unit.position, target_unit.position) * ACTIONS_1.ActionsUnit.Slash.damage(battle, character, unit);
            }
            return 0;
        },
    },
    "AttackKnock": {
        max_utility: 1,
        range: (battle, character, unit) => {
            return ACTIONS_1.ActionsUnit.Knock.range(battle, character, unit);
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            return ACTIONS_1.ActionsUnit.Knock.ap_cost(battle, character, unit, target_character, target_unit);
        },
        execute: (battle, character, unit, target_character, target_unit) => {
            ACTIONS_1.ActionsUnit.Knock.execute(battle, character, unit, target_character, target_unit);
        },
        utility: (battle, character, unit, target_character, target_unit) => {
            if (target_character.dead())
                return 0;
            if (TRIGGERS_1.BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
                return 1 / geom_1.geom.dist(unit.position, target_unit.position) * ACTIONS_1.ActionsUnit.Knock.damage(battle, character, unit);
            }
            return 0;
        },
    },
    "MoveTowards": {
        max_utility: 1,
        range: (battle, character, unit) => {
            return 100;
        },
        ap_cost: (battle, character, unit, target_character, target_unit) => {
            const delta = geom_1.geom.minus(target_unit.position, unit.position);
            const dist = geom_1.geom.norm(delta);
            const range = character.range();
            const max_move = unit.action_points_left / VALUES_1.BattleValues.move_cost(unit, character); // potential movement
            if (dist < range) {
                return 0;
            }
            let distance_to_walk = Math.min(dist - range + 0.01, max_move);
            return distance_to_walk * VALUES_1.BattleValues.move_cost(unit, character);
        },
        execute: (battle, character, unit, target_character, target_unit) => {
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
            events_1.BattleEvent.Move(battle, unit, character, target);
        },
        utility: (battle, character, unit, target_character, target_unit) => {
            if (target_character.dead())
                return 0;
            const delta = geom_1.geom.minus(target_unit.position, unit.position);
            const dist = geom_1.geom.norm(delta);
            const range = character.range();
            if (dist < range) {
                return 0;
            }
            if (!TRIGGERS_1.BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
                return 0;
            }
            return 1 / dist;
        },
    }
};
