"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleAI = void 0;
const geom_1 = require("../geom");
const systems_communication_1 = require("../systems_communication");
const TRIGGERS_1 = require("./TRIGGERS");
const VALUES_1 = require("./VALUES");
var BattleAI;
(function (BattleAI) {
    function calculate_closest_enemy(battle, index) {
        let closest_enemy = undefined;
        // const units = battle.heap.raw_data;
        const unit = battle.heap.get_unit(index);
        let min_distance = 100;
        const character = systems_communication_1.Convert.unit_to_character(unit);
        for (let target_unit of Object.values(battle.heap.data)) {
            if (target_unit == undefined) {
                continue;
            }
            if (target_unit.id == index)
                continue;
            const target_character = systems_communication_1.Convert.unit_to_character(target_unit);
            if (target_character.dead())
                continue;
            const d = geom_1.geom.dist(unit.position, target_unit.position);
            // console.log(target_character.name)
            // console.log(Math.abs(d) <= Math.abs(min_distance), is_enemy(unit, character, target_unit, target_character))
            if (((Math.abs(d) <= Math.abs(min_distance)) || (closest_enemy == undefined))
                && TRIGGERS_1.BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
                closest_enemy = target_unit.id;
                min_distance = d;
            }
        }
        // console.log('closest enemy is found ' + closest_enemy)
        if (closest_enemy != undefined) {
            let cha = systems_communication_1.Convert.unit_to_character(battle.heap.get_unit(closest_enemy));
            // console.log(cha.get_hp())
            // console.log(cha.name)
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
        const pot_move = unit_1.action_points_left / VALUES_1.BattleValues.move_cost(unit_1, attacker); // potential movement
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
    // /**
    //  * Decides on actions of unit  
    //  * Returns false when action is not possible  
    //  * Returns true when action was made
    //  */
    // export function action(battle: Battle, agent_unit: Unit, agent_character: Character): 'end'|'again'|'leave' {
    //     let tactic = agent_character.archetype.ai_battle
    //     if (tactic == 'basic') {
    //         const target_id  = calculate_closest_enemy(battle, agent_unit.id)
    //         const defender_unit = battle.heap.get_unit(target_id)
    //         const attack_move = convert_attack_to_action(battle, agent_unit.id, target_id, 'usual')
    //         // console.log(attack_move)
    //         if (attack_move.action == 'end_turn') return 'end'      
    //         if ((agent_character.perks.magic_bolt) && (agent_unit.action_points_left >= 3)) {
    //             BattleEvent.MagicBolt(battle, agent_unit, defender_unit)
    //             return 'again'
    //         }
    //         if (attack_move.action == 'attack') {
    //             //decide on attack type
    //             const attack_type = Attack.best_melee_damage_type(agent_character)
    //             BattleEvent.Attack(battle, agent_unit, defender_unit, attack_type)
    //             return 'again'
    //         } 
    //         if (attack_move.action == 'fast_attack') {
    //             return 'again'
    //         }
    //         if (attack_move.action == 'move') {
    //             if (agent_character.perks.charge && (agent_unit.action_points_left >= 1)) {
    //                 BattleEvent.Charge(battle, agent_unit, defender_unit)
    //                 return 'again'
    //             }
    //             BattleEvent.Move(battle, agent_unit, attack_move.target)
    //             if (agent_unit.action_points_left < 1) return 'end'
    //             return 'again'
    //         }
    //     }
    //     BattleEvent.Flee(battle, agent_unit)
    //     return 'end'
    // }
})(BattleAI = exports.BattleAI || (exports.BattleAI = {}));
