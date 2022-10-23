"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("./game_modules/base_game_classes/character/system");
const human_1 = require("./game_modules/base_game_classes/character/races/human");
const materials_manager_1 = require("./game_modules/manager_classes/materials_manager");
const system_2 = require("./game_modules/base_game_classes/items/system");
const items_set_up_1 = require("./game_modules/base_game_classes/items/items_set_up");
const equip_1 = require("./game_modules/base_game_classes/inventories/equip");
const inventory_1 = require("./game_modules/base_game_classes/inventories/inventory");
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
    const item = system_2.ItemSystem.create(items_set_up_1.SPEAR_ARGUMENT);
    const item2 = system_2.ItemSystem.create(items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT);
    const id1 = equip.data.backpack.add(item);
    const id2 = equip.data.backpack.add(item2);
    equip.equip_weapon(id1);
}
function character_serialization_test_simple() {
    console.log('basic character serialisation test');
    const character = system_1.CharacterSystem.template_to_character(human_1.HumanTemplateColony, 'peter', 1);
    const string = system_1.CharacterSystem.character_to_string(character);
    const character2 = system_1.CharacterSystem.string_to_character(string);
    const string2 = system_1.CharacterSystem.character_to_string(character2);
    console.log(string == string2);
}
function character_serialisation_test_advanced() {
    console.log('stash, items and skills character serialisation test');
    const character = system_1.CharacterSystem.template_to_character(human_1.HumanTemplateColony, 'peter', 1);
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
    const string = system_1.CharacterSystem.character_to_string(character);
    const character2 = system_1.CharacterSystem.string_to_character(string);
    const string2 = system_1.CharacterSystem.character_to_string(character2);
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
    const item = system_2.ItemSystem.create(items_set_up_1.SPEAR_ARGUMENT);
    const item2 = system_2.ItemSystem.create(items_set_up_1.RAT_SKIN_BOOTS_ARGUMENT);
    backpack.add(item);
    backpack.add(item2);
    const j1 = backpack.to_string();
    const b2 = new inventory_1.Inventory();
    b2.from_string(j1);
    const j2 = b2.to_string();
    console.log(j1 == j2);
}
character_serialization_test_simple();
character_serialisation_test_advanced();
equip_string_test();
backpack_string_test();