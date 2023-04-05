import { terrain, world_dimensions } from "../types"

export interface Development {
    rural: 0|1|2|3;
    urban: 0|1|2|3;
    wild: 0|1|2|3;
    ruins: 0|1|2|3;
    wastelands: 0|1|2|3;
    rupture?: 0|1;
    rats?: 0|1;
    elodinos?: 0|1;
    market?: 1;
}

export interface CellResources {
    water: boolean;
    prey: boolean;
    forest: boolean;
    fish: boolean
}

export const WORLD_SIZE:world_dimensions = [27, 27]

export const STARTING_DEVELOPMENT: {[_ in string]: Development} = {

    // ########################
    // ######## IT'H ##########
    // ########################

    //colony center
    '0_3': {rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0},
    '0_4': {rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0},
    '1_3': {rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0},
    '1_4': {rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0},
    '1_5': {rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0},
    '1_6': {rural: 0, urban: 2, wild: 0, ruins: 0, wastelands: 0},

    //north part
    '1_2': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '2_3': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '2_4': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '3_3': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '3_4': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},

    //fishers quarter
    '2_2': {rural: 2, urban: 0, wild: 0, ruins: 0, wastelands: 0},
    '3_2': {rural: 2, urban: 0, wild: 0, ruins: 0, wastelands: 0},

    //south part
    '2_5': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '2_6': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '2_7': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '3_5': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '3_6': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '3_7': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},
    '3_8': {rural: 0, urban: 1, wild: 0, ruins: 0, wastelands: 0},


    // ########################
    // ######## steppe ########
    // ########################

    //ruptures
    '10_6': {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1},
    '16_6': {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1},
    '12_11': {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1},
    '18_19': {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rupture: 1},

    //small forest outside big city with a settlement
    '7_5': {rural: 0, urban: 1, wild: 1, ruins: 0, wastelands: 0, market: 1},
    '7_6': {rural: 1, urban: 0, wild: 0, ruins: 0, wastelands: 0},
    '6_5': {rural: 1, urban: 0, wild: 0, ruins: 0, wastelands: 0},

    //rat outposts
    '6_7':  {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rats: 1},
    '10_4': {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rats: 1},
    '12_9': {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0, rats: 1},

    //small forest in the middle of the steppe
    '10_8': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '9_8': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},

    // ########################
    // ######## forest ########
    // ########################

    //north part of forest
    //forest 1
    '17_3': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '16_3': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '16_4': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '18_3': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '16_5': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '17_6': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '17_7': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '16_7': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '15_7': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '17_8': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '17_9': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '18_10': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '18_11': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '18_12': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '18_13': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '17_13': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '16_12': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '17_14': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '17_15': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},
    '18_15': {rural: 0, urban: 0, wild: 1, ruins: 0, wastelands: 0},

    //forest 2
    '18_14': {rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0},
    '17_4': {rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0},
    '17_5': {rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0},
    '18_6': {rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0},
    '18_8': {rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0},
    '18_9': {rural: 0, urban: 0, wild: 2, ruins: 0, wastelands: 0},

    //forest 3
    '18_4': {rural: 0, urban: 0, wild: 3, ruins: 0, wastelands: 0, elodinos: 1},
    '18_5': {rural: 0, urban: 0, wild: 3, ruins: 0, wastelands: 0, elodinos: 1},
    '18_7': {rural: 0, urban: 0, wild: 3, ruins: 0, wastelands: 0, elodinos: 1},
}

export const STARTING_TERRAIN: terrain[][] = 
         [['sea', 'sea', 'sea', 'city', 'city', 'sea', 'sea'], 
          ['sea', 'sea', 'city', 'city', 'city', 'city', 'city', 'sea', 'sea'],
          ['sea', 'sea', 'coast', 'steppe', 'steppe', 'city', 'city', 'city', 'sea', 'sea'],
          ['sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'city', 'city', 'sea', 'sea'],
          ['sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast', 'sea', 'sea'],
          ['sea', 'sea', 'sea', 'coast', 'steppe', 'steppe', 'steppe', 'steppe', 'steppe', 'coast',  'sea', 'sea'],
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
          ]

// terrain: {
//     'mages_quarter': 'city',
//     'port': 'city',
//     'living_area': 'red_steppe',
//     'north_rat_coast': 'red_steppe'
// },

export const STARTING_RESOURCES: {[_ in string]: CellResources} = {
    //coast colony
    '3_2': {water: true, prey: false, forest: false, fish: true},
    '2_2': {water: true, prey: false, forest: false, fish: true},
    '1_2': {water: true, prey: false, forest: false, fish: true},
    '1_3': {water: true, prey: false, forest: false, fish: true},
    '0_3': {water: true, prey: false, forest: false, fish: true},
    '0_4': {water: true, prey: false, forest: false, fish: true},
    '1_5': {water: true, prey: false, forest: false, fish: true},
    '1_6': {water: true, prey: false, forest: false, fish: true},
    '2_7': {water: true, prey: false, forest: false, fish: false},
    '3_8': {water: true, prey: false, forest: false, fish: false},

    // north rat coast
    '4_2': {water: true, prey: false, forest: false, fish: true},
    '5_3': {water: true, prey: false, forest: false, fish: true},
    '6_3': {water: true, prey: false, forest: false, fish: true},
    '7_3': {water: true, prey: false, forest: false, fish: true},  

    //south rat coast
    '4_8': {water: true, prey: false, forest: false, fish: false},
    '5_9': {water: true, prey: false, forest: false, fish: false},
    '6_10': {water: true, prey: false, forest: false, fish: false},
    '7_10': {water: true, prey: false, forest: false, fish: false},

    //rat planes
    '5_4': {water: false, prey: true, forest: false, fish: false},
    '5_5': {water: false, prey: true, forest: false, fish: false},
    '5_6': {water: false, prey: true, forest: false, fish: false},
    '5_7': {water: false, prey: true, forest: false, fish: false},
    '5_8': {water: false, prey: true, forest: false, fish: false},
    '6_4': {water: false, prey: true, forest: false, fish: false},
    '6_5': {water: false, prey: true, forest: false, fish: false},
    '6_6': {water: false, prey: true, forest: false, fish: false},
    '6_7': {water: false, prey: true, forest: false, fish: false},
    '6_8': {water: false, prey: true, forest: false, fish: false},
    '6_9': {water: false, prey: true, forest: false, fish: false},
    '7_4': {water: false, prey: true, forest: false, fish: false},
    '7_5': {water: false, prey: true, forest: false, fish: false},
    '7_6': {water: false, prey: true, forest: false, fish: false},
    '7_7': {water: false, prey: true, forest: false, fish: false},
    '7_8': {water: false, prey: true, forest: false, fish: false},
    '7_9': {water: false, prey: true, forest: false, fish: false},
}

export const TERRITORIES = {
    'colony':     ['0_3', '0_4',
                   '1_2', '1_3', '1_4', '1_5', '1_6', 
                   '2_2', '2_3', '2_4', '2_5', '2_6', '2_7', 
                   '3_2', '3_3', '3_4', '3_5', '3_6', '3_7', '3_8'],

    'sea':        ['0_0', '0_1', '0_2', 
                   '1_0', '1_1', '2_0', '2_1', 
                   '3_0', '3_1'],

    'rat_plains': ['4_2', '4_3', '4_4', '4_5', '4_6', '4_7', '4_8',
                   '5_3', '5_4', '5_5', '5_6', '5_7', '5_8', '5_9',
                   '6_3', '6_4', '6_5', '6_6', '6_7', '6_8', '6_9', '6_10',
                   '7_3', '7_4', '7_5', '7_6', '7_7', '7_8', '7_9', '7_10'],
    
}

export const SECTIONS = {
    hexes:{
        'mages_quarter': ['1_6', '1_5', '2_6', '2_7', '3_7', '3_8'],
        'port': ['0_3', '0_4', '1_3'],
        'living_area': ['1_4', '2_5', '3_6', '3_5', '2_4', '3_4'],
        'north_rat_coast': ['4_2', '5_3', '6_3', '7_3']
    },
    territories:{
        'colony': ['mages_quarter', 'port', 'living_area']
    },
    colors:{
        'mages_quarter': [0, 127, 0],
        'port': [0, 0, 127],
        'living_area': [127, 127, 0],
        'north_rat_coast': [0, 0, 0]
    }
}


const OUTPOSTS = {
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
}

// move: {
//     'colony': true,
//     'sea': false,
//     'rat_plains': true
// },

const id_to_territory = {
    0: 'sea',
    1: 'colony',
    2: 'rat_plains'
}

const territory_to_id = {
    'sea': 0,
    'colony': 1,
    'rat_plains': 2
}

const starting_position = {
    'colony': [0, 3],
}
