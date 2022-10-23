import type { Character } from "../../character/character";

import {geom, point} from '../../../geom'
import { Unit } from "../classes/unit";
import { ActionTag, AttackAction, battle_position, FastAttackAction, MoveAction, unit_id } from "../../../../shared/battle_data";
import { Battle } from "../classes/battle";
import { Convert } from "../../../systems_communication";
import { BattleEvent } from "../events";
import { Attack } from "../../character/attack/system";


export namespace BattleAI {

    function calculate_closest_enemy(battle: Battle, index: unit_id):unit_id|undefined {
        let closest_enemy = undefined;
        const units = battle.heap.raw_data;
        const unit = units[index];
        let min_distance = 100;
        for (let i = 0; i < units.length; i++) {
            const target_unit = units[i]
            if (target_unit == undefined) {continue}
            const target_character = Convert.unit_to_character(target_unit)
            const d = geom.dist(unit.position, target_unit.position);
            if (((Math.abs(d) <= Math.abs(min_distance)) || (closest_enemy == undefined))
                && (unit.team != target_unit.team) 
                && (target_character.get_hp() > 0)) 
                {
                    closest_enemy = i as unit_id;
                    min_distance = d;
                }
        }
        return closest_enemy
    }

    function convert_attack_to_action(battle: Battle, ind1: unit_id, ind2: unit_id, tag:"usual"|'fast'): AttackAction|MoveAction|FastAttackAction {
        const unit_1 = battle.heap.get_unit(ind1)
        const unit_2 = battle.heap.get_unit(ind2)

        const attacker = Convert.unit_to_character(unit_1)
        const delta = geom.minus(unit_2.position, unit_1.position);
        const dist = geom.norm(delta)
        const range = attacker.range()

        if (dist > range) {
            let target: point = {x: unit_2.position.x, y: unit_2.position.y}
            let action_tag: ActionTag = "move";
            target.x += geom.normalize(delta).x * (Math.max(dist - range + 0.1, 0));
            target.y += geom.normalize(delta).y * (Math.max(dist - range + 0.1, 0));
            return {action: action_tag, target: target as battle_position}
        } else {
            switch(tag) {
                case 'fast': return {action: 'fast_attack', target: ind2}
            }
            return {action: 'attack', target: ind2}
        }
    }


    /**
     * Decides on actions of unit  
     * Returns false when action is not possible  
     * Returns true when action was made
     */
    export function action(battle: Battle, agent_unit: Unit, agent_character: Character): boolean {
        let tactic = agent_character.archetype.ai_battle
        if (tactic == 'basic') {
            const target_id  = calculate_closest_enemy(battle, agent_unit.id)
            // no target was found
            if (target_id == undefined) {
                return false
            }
            
            const attack_move = convert_attack_to_action(battle, agent_unit.id, target_id, 'usual')

            const defender_unit = battle.heap.get_unit(target_id)


            if (attack_move.action == 'attack') {
                //decide on attack type
                const attack_type = Attack.best_melee_damage_type(agent_character)
                BattleEvent.Attack(battle, agent_unit, defender_unit, attack_type)
                return true
            } 

            if (attack_move.action == 'fast_attack') {
                return true
            }

            if (attack_move.action == 'move') {
                BattleEvent.Move(battle, agent_unit, attack_move.target)
            }
        }
        return false
    }
}