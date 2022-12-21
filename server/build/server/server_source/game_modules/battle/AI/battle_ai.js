"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleAI = void 0;
const geom_1 = require("../../geom");
const systems_communication_1 = require("../../systems_communication");
const events_1 = require("../events");
const system_1 = require("../../character/attack/system");
const data_1 = require("../../data");
const racial_hostility_1 = require("../../character/races/racial_hostility");
const system_2 = require("../system");
var BattleAI;
(function (BattleAI) {
    /**
     * Checks if unit should consider other unit as a target.
     * @param unit
     * @param unit_char
     * @param potential_enemy
     * @param potential_enemy_char
     * @returns
     */
    function is_enemy(unit, unit_char, potential_enemy, potential_enemy_char) {
        if (potential_enemy == undefined)
            return false;
        // team check
        if (unit.team == potential_enemy.team)
            return false;
        // death check
        if (potential_enemy_char.dead())
            return false;
        if (unit_char.dead())
            return false;
        // hostility check:
        // if there is no racial hostility, then check for reputational hostility
        if (!(0, racial_hostility_1.hostile)(unit_char.race(), potential_enemy_char.race())) {
            // we know that they are not hostile because of race.
            // so we check if there b has bad reputation with a's faction
            if (!data_1.Data.Reputation.a_is_enemy_of_b(unit_char.id, potential_enemy_char.id)) {
                // if he is not a racial enemy and not an reputational enemy, then he is not an enemy
                // being in separate teams must be just an accident
                // i should consider tracking personal relationships
                return false;
            }
        }
        // otherwise, he is an enemy
        return true;
    }
    function calculate_closest_enemy(battle, index) {
        let closest_enemy = undefined;
        const units = battle.heap.raw_data;
        const unit = battle.heap.get_unit(index);
        let min_distance = 100;
        const character = systems_communication_1.Convert.unit_to_character(unit);
        for (let i = 0; i < units.length; i++) {
            const target_unit = units[i];
            if (target_unit == undefined) {
                continue;
            }
            const target_character = systems_communication_1.Convert.unit_to_character(target_unit);
            if (target_character.dead())
                continue;
            const d = geom_1.geom.dist(unit.position, target_unit.position);
            if (((Math.abs(d) <= Math.abs(min_distance)) || (closest_enemy == undefined))
                && is_enemy(unit, character, target_unit, target_character)) {
                closest_enemy = target_unit.id;
                min_distance = d;
            }
        }
        console.log('closest enemy is found ' + closest_enemy);
        if (closest_enemy != undefined) {
            let cha = systems_communication_1.Convert.unit_to_character(battle.heap.get_unit(closest_enemy));
            console.log(cha.get_hp());
            console.log(cha.name);
        }
        return closest_enemy;
    }
    function convert_attack_to_action(battle, ind1, ind2, tag) {
        const unit_1 = battle.heap.get_unit(ind1);
        const unit_2 = battle.heap.get_unit(ind2);
        const attacker = systems_communication_1.Convert.unit_to_character(unit_1);
        const delta = geom_1.geom.minus(unit_2.position, unit_1.position);
        const dist = geom_1.geom.norm(delta);
        const range = attacker.range();
        const pot_move = unit_1.action_points_left / system_2.BattleSystem.move_cost(unit_1); // potential movement
        // if target is far away
        if (dist > range) {
            // start with target position
            let target = { x: unit_2.position.x, y: unit_2.position.y };
            let action_tag = "move";
            // subtruct from it range: we want to get into attacking range 
            target.x -= geom_1.geom.normalize(delta).x * (Math.max(range - 0.1, 0));
            target.y -= geom_1.geom.normalize(delta).y * (Math.max(range - 0.1, 0));
            return { action: action_tag, target: target };
        }
        else {
            if (unit_1.action_points_left < 3)
                return { action: 'end_turn' };
            switch (tag) {
                case 'fast': return { action: 'fast_attack', target: ind2 };
            }
            return { action: 'attack', target: ind2 };
        }
    }
    BattleAI.convert_attack_to_action = convert_attack_to_action;
    /**
     * Decides on actions of unit
     * Returns false when action is not possible
     * Returns true when action was made
     */
    function action(battle, agent_unit, agent_character) {
        let tactic = agent_character.archetype.ai_battle;
        if (tactic == 'basic') {
            const target_id = calculate_closest_enemy(battle, agent_unit.id);
            // no target was found
            if (target_id == undefined) {
                console.log('no target found, attempt to leave');
                if (battle.grace_period == 0) {
                    events_1.BattleEvent.Flee(battle, agent_unit);
                    return 'leave';
                }
                else {
                    return 'end';
                }
            }
            const attack_move = convert_attack_to_action(battle, agent_unit.id, target_id, 'usual');
            if (attack_move.action == 'end_turn')
                return 'end';
            const defender_unit = battle.heap.get_unit(target_id);
            if (attack_move.action == 'attack') {
                //decide on attack type
                const attack_type = system_1.Attack.best_melee_damage_type(agent_character);
                events_1.BattleEvent.Attack(battle, agent_unit, defender_unit, attack_type);
                return 'again';
            }
            if (attack_move.action == 'fast_attack') {
                return 'again';
            }
            if (attack_move.action == 'move') {
                events_1.BattleEvent.Move(battle, agent_unit, attack_move.target);
                if (agent_unit.action_points_left < 1)
                    return 'end';
                return 'again';
            }
        }
        events_1.BattleEvent.Flee(battle, agent_unit);
        return 'end';
    }
    BattleAI.action = action;
})(BattleAI = exports.BattleAI || (exports.BattleAI = {}));
