"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materials_manager_1 = require("./game_modules/manager_classes/materials_manager");
const items_set_up_1 = require("./game_modules/items/items_set_up");
const system_1 = require("./game_modules/items/system");
const equip_1 = require("./game_modules/inventories/equip");
const system_2 = require("./game_modules/character/system");
const human_1 = require("./game_modules/races/human");
const inventory_1 = require("./game_modules/inventories/inventory");
const system_3 = require("./game_modules/map/system");
const data_1 = require("./game_modules/data");
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
    const item = system_1.ItemSystem.create(items_set_up_1.SPEAR_ARGUMENT);
    const item2 = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT);
    const id1 = equip.data.backpack.add(item);
    const id2 = equip.data.backpack.add(item2);
    equip.equip_weapon(id1);
}
function character_serialization_test_simple() {
    console.log('basic character serialisation test');
    const character = system_2.CharacterSystem.template_to_character(human_1.Human, 'peter', 1);
    const string = data_1.Data.CharacterDB.character_to_string(character);
    const character2 = data_1.Data.CharacterDB.string_to_character(string);
    const string2 = data_1.Data.CharacterDB.character_to_string(character2);
    console.log(string == string2);
}
function character_serialisation_test_advanced() {
    console.log('stash, items and skills character serialisation test');
    const character = system_2.CharacterSystem.template_to_character(human_1.Human, 'peter', 1);
    character.stash.inc(materials_manager_1.WOOD, 1);
    character.stash.inc(materials_manager_1.MEAT, 1000);
    character.savings.inc(124);
    character.trade_savings.inc(141);
    character.change('blood', 12);
    character.change('fatigue', 41);
    character.change('hp', -40);
    character.change('rage', 11);
    add_testing_items_to_equip(character.equip);
    character.skills.cooking = 40;
    character.perks.meat_master = true;
    character.explored[2] = true;
    character.explored[10] = true;
    const string = data_1.Data.CharacterDB.character_to_string(character);
    const character2 = data_1.Data.CharacterDB.string_to_character(string);
    const string2 = data_1.Data.CharacterDB.character_to_string(character2);
    console.log(string == string2);
}
function equip_string_test() {
    console.log('equip ser test');
    const equip = new equip_1.Equip();
    add_testing_items_to_equip(equip);
    const s1 = equip.to_string();
    const equip2 = new equip_1.Equip;
    equip2.from_string(s1);
    const s2 = equip2.to_string();
    console.log(s1 == s2);
}
function backpack_string_test() {
    console.log('backpack ser test');
    const backpack = new inventory_1.Inventory();
    const item = system_1.ItemSystem.create(items_set_up_1.SPEAR_ARGUMENT);
    const item2 = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT);
    backpack.add(item);
    backpack.add(item2);
    const j1 = backpack.to_string();
    const b2 = new inventory_1.Inventory();
    b2.from_string(j1);
    const j2 = b2.to_string();
    console.log(j1 == j2);
}
function map_coords_test() {
    console.log('coord transformation test');
    let flag = true;
    console.log('coord -> id -> coord');
    for (let i = 0; i <= 10; i++) {
        for (let j = 0; j <= 10; j++) {
            let [x, y] = system_3.MapSystem.id_to_coordinate(system_3.MapSystem.coordinate_to_id(i, j));
            if ((x != i) || (y != j)) {
                console.log(i, j, x, y);
                flag = false;
            }
        }
    }
    console.log('id -> coord -> id');
    for (let i = 0; i <= 500; i++) {
        let tmp = system_3.MapSystem.id_to_coordinate(i);
        let x = system_3.MapSystem.coordinate_to_id(tmp[0], tmp[1]);
        if (i != x) {
            console.log(i, x);
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
