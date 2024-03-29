"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSTS = void 0;
exports.CONSTS = {
    ENEMY_TAGS: ['rat', 'elodino', 'graci'],
    damage_types: new Set(['blunt', 'pierce', 'slice', 'fire']),
    default_tactic_slot: { trigger: { target: 'closest_enemy', tag: 'hp', sign: '>', value: '0' }, action: { target: 'closest_enemy', action: 'attack' } },
    empty_tactic_slot: { trigger: { target: 'closest_enemy', tag: 'hp', sign: '>', value: '0' }, action: { target: 'closest_enemy', action: 'attack' } },
    base_stats: {
        apu: {
            musculature: 10,
            breathing: 10,
            coordination: 10,
            vis: 10,
            int: 10,
            tac: 0,
            mem: 10,
            pow: 10,
            tou: 10
        },
        human: {
            musculature: 10,
            breathing: 10,
            coordination: 10,
            vis: 10,
            int: 10,
            tac: 0,
            mem: 10,
            pow: 10,
            tou: 10
        },
        rat: {
            musculature: 5,
            breathing: 1,
            coordination: 1,
            vis: 1,
            int: 1,
            tac: 0,
            mem: 1,
            pow: 1,
            tou: 1
        },
        elodino: {
            musculature: 10,
            breathing: 10,
            coordination: 10,
            vis: 10,
            int: 10,
            tac: 0,
            mem: 10,
            pow: 10,
            tou: 10
        },
        graci: {
            musculature: 20,
            breathing: 10,
            coordination: 10,
            vis: 10,
            int: 10,
            tac: 0,
            mem: 10,
            pow: 10,
            tou: 10
        }
    },
    base_resists: {
        zero: {
            blunt: 0,
            pierce: 0,
            slice: 0,
            fire: 0
        },
        pepe: {
            blunt: 0,
            pierce: 0,
            slice: 0,
            fire: 0
        },
        rat: {
            blunt: 0,
            pierce: 0,
            slice: 0,
            fire: 0
        }
    },
    base_battle_stats: {
        crit_chance: 0.02,
        attack_crit_add: 0,
        spell_crit_add: 0,
        accuracy: 1,
        crit_mult: 2,
        evasion: 0.02,
        block: 0.02,
        blood_burden: 0.005,
        rage_burden: 0.005,
        regeneration: 0,
        stress_battle_generation: 0.3
    },
    skill_groups: {
        mage: ['mage_training', 'first_steps_in_magic'],
        warrior: ['warrior_training', 'charge', 'blocking_movements'],
        rage_control: ['rage_control', 'cold_rage', 'the_way_of_rage'],
        blood_mage: ['blood_battery'],
        cook: ['cook'],
        mage_craft: ['disenchanting', 'enchanting',],
    },
};
// function add_skill(tag, max_level, req_level = 0, req_skills = [], action = undefined, r_t = true) {
//     CONSTS.SKILLS[tag] = {tag: tag, max_level: max_level, req_level: req_level, req_skills: req_skills, action: action, req_teacher: r_t};
// }
// //warrior
// add_skill('warrior_training',             3, 0);
// add_skill('charge',                       1, 0, ['warrior_training'], 'spell:charge');
// add_skill('blocking_movements',           1, 0, ['warrior_training']);
// //rage control
// add_skill('rage_control',                 1, 0, ['warrior_training']);
// add_skill('cold_rage',                    1, 0, ['rage_control']);
// add_skill('the_way_of_rage',              1, 0, ['cold_rage']);
// //mage
// add_skill('mage_training',                3, 0);
// add_skill('first_steps_in_magic',         1, 0, ['mage_training'], 'spell:kinetic_bolt');
// //blood mage
// add_skill('blood_battery',                1, 0, ['mage_training']);
// //craft
// add_skill('sewing',                       1);
// add_skill('cook',                         5);
// //mage craft
// add_skill('disenchanting',                1, 3, ['first_steps_in_magic']);
// add_skill('enchanting',                   1, 3, ['first_steps_in_magic']);
// //craft improvements
// add_skill('less_stress_from_disenchant',  3, 0, ['disenchanting']);
// add_skill('less_stress_from_crafting',    3);
// add_skill('less_stress_from_making_food', 3, 0, ['less_stress_from_crafting']);
// add_skill('less_stress_from_enchant',     3, 0, ['enchanting']);
