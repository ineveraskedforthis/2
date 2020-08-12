 var CONSTS = {
    TAGS: ['food', 'clothes', 'meat', 'water', 'leather'],
    SKILLS: {},
    damage_types: new Set(['blunt', 'pierce', 'slice', 'fire']),
    
    MAP: {
        '0_0': {move: true, monster: 'Rat'},
        '0_1': {move: false, monster: 'Rat'},
        '1_0': {move: true, monster: 'Graci'},
        '1_1': {move: true, monster: 'Graci'},
        '2_0': {move: true, monster: 'Elodino'},
        '2_1': {move: true, monster: 'Elodino'},
        '2_2': {move: true, monster: 'Elodino'},
        '1_2': {move: true, monster: 'Graci'},
        '0_2': {move: false, monster: 'Elodino'},
    },
    default_tactic_slot: {trigger: {target: 'closest_enemy', tag: 'hp', sign: '>', value: '0'}, action: {target: 'closest_enemy', action: 'attack'}},
    empty_tactic_slot: {trigger: {target: 'closest_enemy', tag: 'hp', sign: '>', value: '0'}, action: {target: 'closest_enemy', action: 'attack'}},
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
        rat: {
            musculature: 1,
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
        }},
    base_resists: {
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
    }
}

function add_skill(tag, max_level, req_level = 0, req_skills = [], action = undefined) {
    CONSTS.SKILLS[tag] = {tag: tag, max_level: max_level, req_level: req_level, req_skills: req_skills, action: action};
}
add_skill('warrior_training', 3);
add_skill('mage_training', 3);
add_skill('rage_control', 1, 0, ['warrior_training']);
add_skill('cold_rage', 1, 0, ['rage_control']);
add_skill('the_way_of_rage', 1, 0, ['cold_rage']);
add_skill('blocking_movements', 1, 0, ['warrior_training']);
add_skill('blood_battery', 1, 0, ['mage_training']);
add_skill('first_steps_in_magic', 1, 0, ['mage_training'], 'spell:kinetic_bolt')

module.exports = CONSTS