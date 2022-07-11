"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSTS = void 0;
exports.CONSTS = {
    ENEMY_TAGS: ['rat', 'elodino', 'graci'],
    damage_types: new Set(['blunt', 'pierce', 'slice', 'fire']),
    development: {
        // ########################
        // ######## IT'H ##########
        // ########################
        //colony center
        '0_3': { rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0 },
        '0_4': { rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0 },
        '1_3': { rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0 },
        '1_4': { rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0 },
        '1_5': { rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0 },
        '1_6': { rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0 },
        //north part
        '1_2': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '2_3': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '2_4': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '3_3': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '3_4': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        //fishers quarter
        '2_2': { rural: 2, urban: 0, wild: 0, ruins: 0, wastelands: 0 },
        '3_2': { rural: 2, urban: 0, wild: 0, ruins: 0, wastelands: 0 },
        //south part
        '2_5': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '2_6': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '2_7': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '3_5': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '3_6': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '3_7': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        '3_8': { rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0 },
        // ########################
        // ######## steppe ########
        // ########################
        //ruptures
        '10_6': { rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1 },
        '16_6': { rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1 },
        '12_11': { rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1 },
        '18_19': { rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1 },
        //small forest outside big city with a settlement
        '7_5': { rural: 0, urban: 1, wild: 1, ruins: 0, wastelands: 0 },
        '7_6': { rural: 1, urban: 0, wild: 0, ruins: 0, wastelands: 0 },
        '6_5': { rural: 1, urban: 0, wild: 0, ruins: 0, wastelands: 0 },
        //small forest in the middle of the steppe
        '10_8': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '9_8': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        // ########################
        // ######## forest ########
        // ########################
        //north part of forest
        //forest 1
        '17_3': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '16_3': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '16_4': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '18_3': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '16_5': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '17_6': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '17_7': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '16_7': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '15_7': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '17_8': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '17_9': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '18_10': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '18_11': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '18_12': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '18_13': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '17_13': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '16_12': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '17_14': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '17_15': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        '18_15': { rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0 },
        //forest 2
        '18_14': { rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0 },
        '17_4': { rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0 },
        '17_5': { rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0 },
        '18_6': { rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0 },
        '18_8': { rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0 },
        '18_9': { rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0 },
        //forest 3
        '18_4': { rural: 0, urban: 0, wild: 3, ruins: 0, wastelands: 0 },
        '18_5': { rural: 0, urban: 0, wild: 3, ruins: 0, wastelands: 0 },
        '18_7': { rural: 0, urban: 0, wild: 3, ruins: 0, wastelands: 0 },
    },
    terrain: [['sea', 'sea', 'sea', 'city', 'city', 'sea', 'sea'],
        ['sea', 'sea', 'city', 'city', 'city', 'city', 'city', 'sea', 'sea'],
        ['sea', 'sea', 'coast', 'steppe', 'steppe', 'city', 'city', 'city', 'sea', 'sea'],
        ['sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'city', 'city', 'sea', 'sea'],
        ['sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'sea', 'sea'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'sea', 'sea'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'sea', 'sea'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'sea', 'sea'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'sea', 'sea'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'sea', 'sea'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'coast', 'coast', 'coast', 'coast'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe',],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe'],
        ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe'],
    ],
    // terrain: {
    //     'mages_quarter': 'city',
    //     'port': 'city',
    //     'living_area': 'red_steppe',
    //     'north_rat_coast': 'red_steppe'
    // },
    resources: {
        //coast colony
        '3_2': { water: true, prey: false, forest: false, fish: true },
        '2_2': { water: true, prey: false, forest: false, fish: true },
        '1_2': { water: true, prey: false, forest: false, fish: false },
        '1_3': { water: true, prey: false, forest: false, fish: false },
        '0_3': { water: true, prey: false, forest: false, fish: false },
        '0_4': { water: true, prey: false, forest: false, fish: false },
        '1_5': { water: true, prey: false, forest: false, fish: false },
        '1_6': { water: true, prey: false, forest: false, fish: false },
        '2_7': { water: true, prey: false, forest: false, fish: false },
        '3_8': { water: true, prey: false, forest: false, fish: false },
        // north rat coast
        '4_2': { water: true, prey: false, forest: false, fish: true },
        '5_3': { water: true, prey: false, forest: false, fish: true },
        '6_3': { water: true, prey: false, forest: false, fish: true },
        '7_3': { water: true, prey: false, forest: false, fish: true },
        //south rat coast
        '4_8': { water: true, prey: false, forest: false, fish: false },
        '5_9': { water: true, prey: false, forest: false, fish: false },
        '6_10': { water: true, prey: false, forest: false, fish: false },
        '7_10': { water: true, prey: false, forest: false, fish: false },
        //rat planes
        '5_4': { water: false, prey: true, forest: false, fish: false },
        '5_5': { water: false, prey: true, forest: false, fish: false },
        '5_6': { water: false, prey: true, forest: false, fish: false },
        '5_7': { water: false, prey: true, forest: false, fish: false },
        '5_8': { water: false, prey: true, forest: false, fish: false },
        '6_4': { water: false, prey: true, forest: false, fish: false },
        '6_5': { water: false, prey: true, forest: false, fish: false },
        '6_6': { water: false, prey: true, forest: false, fish: false },
        '6_7': { water: false, prey: true, forest: false, fish: false },
        '6_8': { water: false, prey: true, forest: false, fish: false },
        '6_9': { water: false, prey: true, forest: false, fish: false },
        '7_4': { water: false, prey: true, forest: false, fish: false },
        '7_5': { water: false, prey: true, forest: false, fish: false },
        '7_6': { water: false, prey: true, forest: false, fish: false },
        '7_7': { water: false, prey: true, forest: false, fish: false },
        '7_8': { water: false, prey: true, forest: false, fish: false },
        '7_9': { water: false, prey: true, forest: false, fish: false },
    },
    territories: {
        'colony': ['0_3', '0_4',
            '1_2', '1_3', '1_4', '1_5', '1_6',
            '2_2', '2_3', '2_4', '2_5', '2_6', '2_7',
            '3_2', '3_3', '3_4', '3_5', '3_6', '3_7', '3_8'],
        'sea': ['0_0', '0_1', '0_2',
            '1_0', '1_1', '2_0', '2_1',
            '3_0', '3_1'],
        'rat_plains': ['4_2', '4_3', '4_4', '4_5', '4_6', '4_7', '4_8',
            '5_3', '5_4', '5_5', '5_6', '5_7', '5_8', '5_9',
            '6_3', '6_4', '6_5', '6_6', '6_7', '6_8', '6_9', '6_10',
            '7_3', '7_4', '7_5', '7_6', '7_7', '7_8', '7_9', '7_10'],
    },
    sections: {
        hexes: {
            'mages_quarter': ['1_6', '1_5', '2_6', '2_7', '3_7', '3_8'],
            'port': ['0_3', '0_4', '1_3'],
            'living_area': ['1_4', '2_5', '3_6', '3_5', '2_4', '3_4'],
            'north_rat_coast': ['4_2', '5_3', '6_3', '7_3']
        },
        territories: {
            'colony': ['mages_quarter', 'port', 'living_area']
        },
        colors: {
            'mages_quarter': [0, 127, 0],
            'port': [0, 0, 127],
            'living_area': [127, 127, 0],
            'north_rat_coast': [0, 0, 0]
        }
    },
    enemies: {
        'colony': 'rat',
        'rat_plains': 'rat'
    },
    ter_danger: {
        'colony': 0,
        'rat_plains': 3
    },
    outposts: {
        '5_4': {
            res: 'water',
            enemy: 'rat',
            res_amount: 5,
            enemy_amount: 4
        },
        '6_9': {
            res: 'water',
            enemy: 'rat',
            res_amount: 5,
            enemy_amount: 4
        }
    },
    teachers: {
        '1_6': 'mage',
        '3_3': 'warrior',
        '0_3': 'cook'
    },
    move: {
        'colony': true,
        'sea': false,
        'rat_plains': true
    },
    terr_id: {
        0: 'sea',
        1: 'colony',
        2: 'rat_plains'
    },
    id_terr: {
        'sea': 0,
        'colony': 1,
        'rat_plains': 2
    },
    starting_position: {
        'colony': [0, 3],
    },
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
    SKILLS: {
        clothier: { practice: 0, theory: 0 },
        cooking: { practice: 0, theory: 0 },
        onehand: { practice: 0, theory: 0 },
        polearms: { practice: 0, theory: 0 },
        noweapon: { practice: 0, theory: 0 },
        skinning: { practice: 0, theory: 0 },
        hunt: { practice: 0, theory: 0 },
        woodwork: { practice: 0, theory: 0 },
        magic_mastery: { practice: 0, theory: 0 },
        blocking: { practice: 0, theory: 0 },
        evasion: { practice: 0, theory: 0 },
    }
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
