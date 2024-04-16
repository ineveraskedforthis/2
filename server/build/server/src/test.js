"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_objects_1 = require("./game_modules/data/data_objects");
const system_1 = require("./game_modules/character/system");
const TEMPLATE_HUMANS_1 = require("./game_modules/races/TEMPLATE_HUMANS");
const inventory_1 = require("./game_modules/inventories/inventory");
const strings_management_1 = require("./game_modules/data/strings_management");
data_objects_1.Data.World.load_world_dimensions(data_objects_1.save_path.WORLD_DIMENSIONS);
data_objects_1.Data.World.load_terrain(data_objects_1.save_path.TERRAIN);
data_objects_1.Data.Cells.load(data_objects_1.save_path.CELLS);
data_objects_1.Data.World.load();
function string_difference([a, b]) {
    let resulta = '';
    let resultb = '';
    for (let i = 1; i < Math.max(a.length, b.length); i++) {
        if (a[i] != b[i]) {
            resulta += a[i];
            resultb += b[i];
        }
    }
    return [resulta, resultb];
}
function add_testing_items_to_equip(equip) {
    const item = data_objects_1.Data.Items.create_weapon_simple(1 /* WEAPON.SPEAR_WOOD_RED */);
    const item2 = data_objects_1.Data.Items.create_armour_simple(5 /* ARMOUR.MAIL_LEATHER_RAT */);
    const id1 = equip.data.backpack.add(item.id);
    const id2 = equip.data.backpack.add(item2.id);
    if (id1 !== false)
        equip.equip_weapon(id1, 'human');
}
function character_serialization_test_simple() {
    console.log('basic character serialisation test');
    const character = system_1.CharacterSystem.template_to_character(TEMPLATE_HUMANS_1.HumanTemplate, 'peter', 1);
    const string = (0, strings_management_1.character_to_string)(character);
    const character2 = (0, strings_management_1.string_to_character)(string);
    const string2 = (0, strings_management_1.character_to_string)(character2);
    // console.log(string_difference([string, string2]))
    console.log(string == string2);
}
function character_serialisation_test_advanced() {
    console.log('stash, items and skills character serialisation test');
    const character = system_1.CharacterSystem.template_to_character(TEMPLATE_HUMANS_1.HumanTemplate, 'peter', 1);
    character.stash.inc(31 /* MATERIAL.WOOD_RED */, 1);
    character.stash.inc(18 /* MATERIAL.MEAT_RAT */, 1000);
    character.savings.inc(124);
    character.trade_savings.inc(141);
    character.change('blood', 12);
    character.change('fatigue', 41);
    character.change('hp', -40);
    character.change('rage', 11);
    add_testing_items_to_equip(character.equip);
    character._skills.cooking = 40;
    character._perks.meat_master = true;
    character._traits.bipolar_disorder_high = true;
    character.explored[2] = true;
    character.explored[10] = true;
    const string = (0, strings_management_1.character_to_string)(character);
    const character2 = (0, strings_management_1.string_to_character)(string);
    const string2 = (0, strings_management_1.character_to_string)(character2);
    // console.log(string)
    // console.log(string2)
    // console.log(string_difference([string, string2]))
    console.log(string == string2);
}
// function equip_string_test() {
//     console.log('equip ser test')
//     const equip = new Equip()
//     add_testing_items_to_equip(equip)
//     const s1 = equip_to_string(equip)
//     const equip2 = new Equip
//     equip_from_string(s1, equip2)
//     // equip2.from_string(s1)
//     const s2 = equip_to_string(equip2)
//     // console.log(string_difference([s1, s2]))
//     // console.log(s1)
//     // console.log(s2)
//     console.log(s1 == s2)
// }
function backpack_string_test() {
    console.log('backpack ser test');
    const backpack = new inventory_1.Inventory(10);
    const item = data_objects_1.Data.Items.create_weapon_simple(1 /* WEAPON.SPEAR_WOOD_RED */);
    const item2 = data_objects_1.Data.Items.create_armour_simple(12 /* ARMOUR.BOOTS_LEATHER_RAT */);
    backpack.add(item.id);
    backpack.add(item2.id);
    const j1 = (0, strings_management_1.inventory_to_string)(backpack);
    const b2 = new inventory_1.Inventory(10);
    (0, strings_management_1.inventory_from_string)(b2, j1);
    const j2 = (0, strings_management_1.inventory_to_string)(b2);
    console.log(j1 == j2);
}
function map_coords_test() {
    console.log('coord transformation test');
    let flag = true;
    console.log('coord -> id -> coord');
    for (let i = 0; i <= 10; i++) {
        for (let j = 0; j <= 10; j++) {
            let [x, y] = data_objects_1.Data.World.id_to_coordinate(data_objects_1.Data.World.coordinate_to_id([i, j]));
            if ((x != i) || (y != j)) {
                // console.log(i, j, x, y)
                flag = false;
            }
        }
    }
    console.log('id -> coord -> id');
    for (let i = 0; i <= 500; i++) {
        let tmp = data_objects_1.Data.World.id_to_coordinate(i);
        let x = data_objects_1.Data.World.coordinate_to_id([tmp[0], tmp[1]]);
        if (i != x) {
            // console.log(i, x)
            flag = false;
        }
    }
    console.log(flag);
}
character_serialization_test_simple();
character_serialisation_test_advanced();
// equip_string_test()
backpack_string_test();
map_coords_test();
