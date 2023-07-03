"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materials_manager_1 = require("./game_modules/manager_classes/materials_manager");
// import { RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_BOOTS_ARGUMENT, SPEAR_ARGUMENT } from "./game_modules/items/items_set_up";
const system_1 = require("./game_modules/items/system");
const equip_1 = require("./game_modules/inventories/equip");
const system_2 = require("./game_modules/character/system");
const TEMPLATE_HUMANS_1 = require("./game_modules/races/TEMPLATE_HUMANS");
const inventory_1 = require("./game_modules/inventories/inventory");
const data_1 = require("./game_modules/data");
const strings_management_1 = require("./game_modules/strings_management");
data_1.Data.World.load_world_dimensions(data_1.save_path.WORLD_DIMENSIONS);
data_1.Data.Cells.load(data_1.save_path.CELLS);
data_1.Data.World.load();
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
    const item = system_1.ItemSystem.create('spear', [], 100);
    const item2 = system_1.ItemSystem.create('rat_skin_armour', [], 100);
    const id1 = equip.data.backpack.add(item);
    const id2 = equip.data.backpack.add(item2);
    if (id1 != false)
        equip.equip_weapon(id1, 'human');
}
function character_serialization_test_simple() {
    console.log('basic character serialisation test');
    const character = system_2.CharacterSystem.template_to_character(TEMPLATE_HUMANS_1.HumanTemplate, 'peter', 1);
    const string = (0, strings_management_1.character_to_string)(character);
    const character2 = (0, strings_management_1.string_to_character)(string);
    const string2 = (0, strings_management_1.character_to_string)(character2);
    // console.log(string_difference([string, string2]))
    console.log(string == string2);
}
function character_serialisation_test_advanced() {
    console.log('stash, items and skills character serialisation test');
    const character = system_2.CharacterSystem.template_to_character(TEMPLATE_HUMANS_1.HumanTemplate, 'peter', 1);
    character.stash.inc(materials_manager_1.WOOD, 1);
    character.stash.inc(materials_manager_1.MEAT, 1000);
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
function equip_string_test() {
    console.log('equip ser test');
    const equip = new equip_1.Equip();
    add_testing_items_to_equip(equip);
    const s1 = (0, strings_management_1.equip_to_string)(equip);
    const equip2 = new equip_1.Equip;
    (0, strings_management_1.equip_from_string)(s1, equip2);
    // equip2.from_string(s1)
    const s2 = (0, strings_management_1.equip_to_string)(equip2);
    // console.log(string_difference([s1, s2]))
    // console.log(s1)
    // console.log(s2)
    console.log(s1 == s2);
}
function backpack_string_test() {
    console.log('backpack ser test');
    const backpack = new inventory_1.Inventory(10);
    const item = system_1.ItemSystem.create('spear', [], 100);
    const item2 = system_1.ItemSystem.create('rat_skin_boots', [], 100);
    backpack.add(item);
    backpack.add(item2);
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
            let [x, y] = data_1.Data.World.id_to_coordinate(data_1.Data.World.coordinate_to_id([i, j]));
            if ((x != i) || (y != j)) {
                // console.log(i, j, x, y)
                flag = false;
            }
        }
    }
    console.log('id -> coord -> id');
    for (let i = 0; i <= 500; i++) {
        let tmp = data_1.Data.World.id_to_coordinate(i);
        let x = data_1.Data.World.coordinate_to_id([tmp[0], tmp[1]]);
        if (i != x) {
            // console.log(i, x)
            flag = false;
        }
    }
    console.log(flag);
}
character_serialization_test_simple();
character_serialisation_test_advanced();
equip_string_test();
backpack_string_test();
map_coords_test();
