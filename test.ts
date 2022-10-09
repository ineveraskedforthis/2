import { CharacterSystem } from "./game_modules/base_game_classes/character/system";
import { HumanTemplateColony } from "./game_modules/base_game_classes/character/races/human";
import { cell_id, money } from "./game_modules/types";
import { MEAT, WOOD } from "./game_modules/manager_classes/materials_manager";
import { ItemSystem } from "./game_modules/base_game_classes/items/system";
import { RAT_SKIN_BOOTS_ARGUMENT, SPEAR_ARGUMENT } from "./game_modules/base_game_classes/items/items_set_up";
import { Equip } from "./game_modules/base_game_classes/inventories/equip";
import { Inventory } from "./game_modules/base_game_classes/inventories/inventory";

function string_difference([a, b]: [string, string]): [string, string] {
    let resulta = ''
    let resultb = ''

    for (let i = 1; i < Math.max(a.length, b.length); i++) {
        if (a[i] != b[i]) {
            resulta += a[i]
            resultb += b[i]
        }
    }

    return [resulta, resultb]
}


function add_testing_items_to_equip(equip: Equip) {
    const item = ItemSystem.create(SPEAR_ARGUMENT)
    const item2 = ItemSystem.create(RAT_SKIN_BOOTS_ARGUMENT)
    const id1 = equip.data.backpack.add(item)
    const id2 = equip.data.backpack.add(item2)
    equip.equip_weapon(id1)
}

function character_serialization_test_simple() {
    console.log('basic character serialisation test')
    const character = CharacterSystem.template_to_character(HumanTemplateColony, 'peter', 1 as cell_id)
    const string = CharacterSystem.character_to_string(character)
    const character2 = CharacterSystem.string_to_character(string)
    const string2 = CharacterSystem.character_to_string(character2)

    console.log(string == string2)
}

function character_serialisation_test_advanced() {
    console.log('stash, items and skills character serialisation test')
    const character = CharacterSystem.template_to_character(HumanTemplateColony, 'peter', 1 as cell_id)
    character.stash.inc(WOOD, 1)
    character.stash.inc(MEAT, 1000)
    character.savings.inc(124 as money)
    character.trade_savings.inc(141 as money)

    character.change('blood', 12)
    character.change('fatigue', 41)
    character.change('hp', -40)
    character.change('rage', 11)

    add_testing_items_to_equip(character.equip)

    character.skills.cooking = 40
    character.perks.meat_master = true

    character.explored[2] = true
    character.explored[10] = true

    const string = CharacterSystem.character_to_string(character)
    const character2 = CharacterSystem.string_to_character(string)
    const string2 = CharacterSystem.character_to_string(character2)

    console.log(string==string2)
}

function equip_string_test() {
    console.log('equip ser test')
    const equip = new Equip()
    add_testing_items_to_equip(equip)

    const s1 = equip.to_string()
    const equip2 = new Equip
    equip2.from_string(s1)
    const s2 = equip2.to_string()

    console.log(s1 == s2)
}

function backpack_string_test() {
    console.log('backpack ser test')
    const backpack = new Inventory()
    const item = ItemSystem.create(SPEAR_ARGUMENT)
    const item2 = ItemSystem.create(RAT_SKIN_BOOTS_ARGUMENT)
    backpack.add(item)
    backpack.add(item2)

    const j1 = backpack.to_string()
    const b2 = new Inventory()
    b2.from_string(j1)
    const j2 = b2.to_string()

    console.log(j1 == j2)
}


character_serialization_test_simple()
character_serialisation_test_advanced()
equip_string_test()
backpack_string_test()