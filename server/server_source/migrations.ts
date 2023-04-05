import * as path from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { EloTemplate } from "./game_modules/races/elo"
import { GraciTemplate } from "./game_modules/races/graci"
import { Human, RatHunterHuman } from "./game_modules/races/human"
import { RatTemplate } from "./game_modules/races/rat"
import { CharacterSystem } from "./game_modules/character/system"
import { Data } from "./game_modules/data"
import { Event } from "./game_modules/events/events"
import { EventInventory } from "./game_modules/events/inventory_events"
import { EventMarket } from "./game_modules/events/market"
import { Factions } from "./game_modules/factions"
import { BONE_SPEAR_ARGUMENT, RAT_SKIN_ARMOUR_ARGUMENT } from "./game_modules/items/items_set_up"
import { ItemSystem } from "./game_modules/items/system"
import { ARROW_BONE, ELODINO_FLESH, FOOD, GRACI_HAIR, MEAT, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "./game_modules/manager_classes/materials_manager"
import { MapSystem } from "./game_modules/map/system"
import { money } from "./game_modules/types"
import { constants } from "./game_modules/static_data/constants";
import { Convert } from "./game_modules/systems_communication";
import { Cell } from "./game_modules/map/cell";


const LUMP_OF_MONEY = 1000 as money
const TONS_OF_MONEY = 30000 as money


var SAVE_GAME_PATH = path.join('save_1')
if (!existsSync(SAVE_GAME_PATH)){
    mkdirSync(SAVE_GAME_PATH);
}
console.log(SAVE_GAME_PATH)

const version_path = path.join(SAVE_GAME_PATH, 'version.txt')

function get_version_raw():string {
    if (!existsSync(version_path)) {
        writeFileSync(version_path, '')
    }
    return readFileSync(version_path).toString()
}

export function set_version(n: number) {
    console.log('set version ' + n)
    writeFileSync(version_path, '' + n)
}

function get_version():number {
    let data = Number(get_version_raw())
    return data
}

export function migrate(current_version:number, target_version:number) {
    MapSystem.load()
    Data.load()

    console.log('migration from ' + current_version  + ' to ' + target_version)
    if (current_version == 0) {
        set_up_initial_data()
        current_version = 1
    } 

    if (current_version == 1) {
        create_starting_agents()
        set_version(2)
        current_version = 2
    }

    if (current_version == 2) {
        set_up_cooks()
        set_version(3)
        current_version = 3
    }

    if (current_version == 3) {
        set_up_guards_1()
        set_version(4)
        current_version = 4
    }

    if (current_version == 4) {
        cancel_cook_orders()
        set_version(5)
        current_version = 5
    }

    if (current_version == 5) {
        misc_characters()
        set_version(6)
        current_version = 6
    }

    if (current_version == 6) {
        fix_factions()
        set_version(7)
        current_version = 7
    }

    if (current_version == 7) {
        more_crafters()
        set_version(8)
        current_version = 8
    }

    if (current_version == 8) {
        alchemists()
        set_version(9)
        current_version = 9
    }

    if (current_version == 9) {
        shoemakers()
        set_version(10)
        current_version = 10
    }

    if (current_version == 10) {
        monk()
        set_version(11)
        current_version = 11
    }

    if (current_version == 11) {
        rat_hunter(7, 5)
        set_version(12)
        current_version = 12
    }

    if (current_version == 12) {
        for (let item of Data.CharacterDB.list()) {
            EventMarket.clear_orders(item)
        }
    }

    // if (current_version == 12) {
    //     rat_hunter(7, 5)
    //     set_version(12)
    //     current_version = 12
    // }
}

function set_up_initial_data() {
    set_version(1)
}



function create_starting_agents() {
    

    MapSystem.load()
    Data.load()

    const RatsStartingCell = MapSystem.coordinate_to_id(6, 5)
    const GraciStartingCell = MapSystem.coordinate_to_id(15, 8)
    const EloStartingCell = MapSystem.coordinate_to_id(18, 4)

    const dummy_model = {chin: 0, mouth: 0, eyes: 0}

    for (let i = 1; i < 60; i++) {
        Event.new_character(RatTemplate, undefined, RatsStartingCell, dummy_model)
    }

    for (let i = 1; i < 20; i++) {
        Event.new_character(GraciTemplate, undefined, GraciStartingCell, dummy_model)
    }

    for (let i = 1; i < 30; i++) {
        Event.new_character(EloTemplate, undefined, EloStartingCell, dummy_model)
    }
    
    /// test person

    const starting_cell_colony = MapSystem.coordinate_to_id(0, 3)
    
    {
        let Trader = Event.new_character(Human, 'Trader', starting_cell_colony, dummy_model)
                
        Trader.stash.inc(MEAT, 10)
        Trader.stash.inc(WOOD, 100)
        Trader.stash.inc(FOOD, 500)
        Trader.stash.inc(RAT_BONE, 100)
        Trader.stash.inc(WOOD, 100)
        Trader.stash.inc(RAT_SKIN, 100)
        Trader.stash.inc(ZAZ, 100)
        Trader.stash.inc(ELODINO_FLESH, 100)
        Trader.savings.set(5000 as money)

        Data.Reputation.set(Factions.City.id, Trader.id, 'member')

        EventMarket.buy(Trader, MEAT, 200, 5 as money)
        EventMarket.sell(Trader, FOOD, 200, 15 as money)
        EventMarket.sell(Trader, ZAZ, 100, 200 as money)

        const spear = ItemSystem.create(BONE_SPEAR_ARGUMENT)
        spear.affixes.push({'tag': 'sharp'})
        const index = EventInventory.add_item(Trader, spear)
        EventMarket.sell_item(Trader, index, 50 as money)
    }

    // let monk =  this.create_new_character(pool, 'Old monk', this.get_cell_id_by_x_y(7, 5), -1)
    // monk.skills.noweapon = 100
    // monk.learn_perk("advanced_unarmed")
    // monk.faction_id = 3
    // monk.changed = true    
}

const dummy_model = {chin: 0, mouth: 0, eyes: 0}
function create_cook(x: number, y: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    const cook =  Event.new_character(Human, 'Local cook', cell, dummy_model)
    cook.stash.inc(FOOD, 10)
    cook.savings.inc(500 as money)
    cook.skills.cooking = 100
    cook.perks.meat_master = true
    return cook
}

function create_guard(x: number, y: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let spearman =  Event.new_character(Human, 'Local militia', cell, dummy_model)
    spearman.skills.polearms = 100
    spearman.perks.advanced_polearm = true
    let spear = ItemSystem.create(BONE_SPEAR_ARGUMENT)
    let armour = ItemSystem.create(RAT_SKIN_ARMOUR_ARGUMENT)
    spearman.equip.data.weapon = spear
    spearman.equip.data.armour.body = armour
    let index = EventInventory.add_item(spearman, spear)
    EventInventory.equip_from_backpack(spearman, index)

    return spearman
}

function rat_hunter(x: number, y: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let spearman =  Event.new_character(RatHunterHuman, 'Rat hunter', cell, dummy_model)
    spearman.skills.polearms = 100
    spearman.perks.advanced_polearm = true
    let spear = ItemSystem.create(BONE_SPEAR_ARGUMENT)
    spear.durability = 200
    let armour = ItemSystem.create(RAT_SKIN_ARMOUR_ARGUMENT)
    spearman.equip.data.weapon = spear
    spearman.equip.data.armour.body = armour
    spearman.archetype.ai_map = 'rat_hunter'
    Data.CharacterDB.save()
    // let index = EventInventory.add_item(spearman, spear)
    // EventInventory.equip_from_backpack(spearman, index)
}

function fletcher(x: number, y: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let fletcher = Event.new_character(Human, 'Fletcher', cell, dummy_model)

    fletcher.skills.woodwork = 100
    fletcher.perks.fletcher = true
    fletcher.skills.ranged = 30

    fletcher.stash.inc(ARROW_BONE, 50)
    fletcher.stash.inc(RAT_BONE, 3)
    fletcher.stash.inc(WOOD, 1)

    fletcher.savings.inc(LUMP_OF_MONEY)
    return fletcher
}

function mage(x: number, y: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let mage = Event.new_character(Human, 'Mage', cell, dummy_model)

    mage.skills.magic_mastery = 100
    mage.perks.mage_initiation = true
    mage.perks.magic_bolt = true

    mage.stash.inc(ZAZ, 300)
    mage.savings.inc(TONS_OF_MONEY)

    EventMarket.sell(mage, ZAZ, 200, 50 as money)
    EventMarket.buy( mage, ELODINO_FLESH, 200, 20 as money )
    EventMarket.buy( mage, GRACI_HAIR, 10, 1000 as money)

    return mage
}

function blood_mage(x: number, y: number, faction_id: number) {
    const blood_mage = mage(x, y)
    blood_mage.perks.blood_mage = true
    Data.Reputation.set(faction_id, blood_mage.id, "member")

    return blood_mage
}

function alchemist(x: number, y: number, faction_id: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let alchemist = Event.new_character(Human, 'Alchemist', cell, dummy_model)

    alchemist.skills.magic_mastery = 60
    alchemist.perks.mage_initiation = true
    alchemist.perks.alchemist = true

    alchemist.stash.inc(ZAZ, 5)
    alchemist.savings.inc(TONS_OF_MONEY)

    Data.Reputation.set(faction_id, alchemist.id, "member")

    return alchemist
}

function armour_master(x: number, y: number, faction_id: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let master = Event.new_character(Human, 'Armourer', cell, dummy_model)

    master.skills.clothier = 100
    master.perks.skin_armour_master = true
    master.stash.inc(RAT_SKIN, 50)
    master.savings.inc(LUMP_OF_MONEY)

    Data.Reputation.set(faction_id, master.id, "member")
    
    return master
}

function shoemaker(x: number, y: number, faction_id: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let master = Event.new_character(Human, 'Shoemaker', cell, dummy_model)

    master.skills.clothier = 100
    master.perks.shoemaker = true
    master.stash.inc(RAT_SKIN, 50)
    master.savings.inc(LUMP_OF_MONEY)

    Data.Reputation.set(faction_id, master.id, "member")
    
    return master
}

function weapon_master_wood(x: number, y: number, faction_id: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let master = Event.new_character(Human, 'Weapons maker', cell, dummy_model)

    master.skills.woodwork = 100
    master.perks.weapon_maker = true
    master.stash.inc(WOOD, 15)
    master.savings.inc(LUMP_OF_MONEY)

    Data.Reputation.set(faction_id, master.id, "member")
    
    return master
}

function bone_carver_weapon(x: number, y: number, faction_id: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let master = Event.new_character(Human, 'Weapons maker', cell, dummy_model)

    master.skills.bone_carving = 100
    master.perks.weapon_maker = true
    master.stash.inc(RAT_BONE, 40)
    master.savings.inc(LUMP_OF_MONEY)

    Data.Reputation.set(faction_id, master.id, "member")
    
    return master
}

function unarmed_master(x: number, y: number, faction_id: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    let master = Event.new_character(Human, 'Monk', cell, dummy_model)

    master.skills.noweapon = 100
    master.perks.dodge = true
    master.perks.advanced_unarmed = true
    master.savings.inc(LUMP_OF_MONEY)

    Data.Reputation.set(faction_id, master.id, "member")
    
    return master
}



function city_guard(x: number, y: number) {
    let guard = create_guard(x, y)
    Data.Reputation.set(Factions.City.id, guard.id, "member")
}

function set_up_cooks() {
    let cook_forest = create_cook(7, 5)
    Data.Reputation.set(Factions.Steppes.id, cook_forest.id, "member")

    let cook_port = create_cook(0, 3)
    Data.Reputation.set(Factions.City.id, cook_port.id, "member")

    let cook_port2 = create_cook(3, 8)
    Data.Reputation.set(Factions.City.id, cook_port2.id, "member")

    let cook_port3 = create_cook(1, 6)
    Data.Reputation.set(Factions.City.id, cook_port3.id, "member")


}

function set_up_guards_1() {
    let guard_forest = create_guard(7, 5)
    Data.Reputation.set(Factions.Steppes.id, guard_forest.id, "member")
    city_guard(0, 3)
    city_guard(0, 3)
    city_guard(3, 8)
    city_guard(1, 6)
    city_guard(3, 5)
    city_guard(1, 3)
    city_guard(2, 5)
    city_guard(0, 4)
}

function cancel_cook_orders() {
    console.log('cancelling orders of cooks')

    for (let character of Data.CharacterDB.list()) {
        if (character.name != 'Trader') {
            EventMarket.clear_orders(character)
        }        
    }
}

function misc_characters() {
    const fletcher_city = fletcher(3, 3)
    Data.Reputation.set(Factions.City.id, fletcher_city.id, "member")

    const fletcher_city_south = fletcher(3, 6)
    Data.Reputation.set(Factions.City.id, fletcher_city_south.id, "member")

    const fletcher_forest = fletcher(7, 5)
    Data.Reputation.set(Factions.Steppes.id, fletcher_forest.id, "member")

    const mage_city = mage(1, 6)
    Data.Reputation.set(Factions.Mages.id, mage_city.id, "friend")
    Data.Reputation.set(Factions.Mages.id, mage_city.id, "member")

    armour_master(0, 3, Factions.City.id)
}

function fix_factions() {
    const EloStartingCell = MapSystem.coordinate_to_cell([18, 4])
    for (let character of Data.CharacterDB.list()) {
        if (character.race() == 'elo') {
            Data.Reputation.set(Factions.Elodinos.id, character.id, "member")
            if (Convert.character_to_cell(character).development.wild == 0) {
                Event.move(character, EloStartingCell as Cell)
            }
        }
        if (character.race() == 'graci') {
            Data.Reputation.set(Factions.Graci.id, character.id, "member")
        }
    }
}

function more_crafters() {
    weapon_master_wood(0, 3, Factions.City.id)
    weapon_master_wood(3, 4, Factions.City.id)
    weapon_master_wood(3, 6, Factions.City.id)
    weapon_master_wood(0, 7, Factions.City.id)

    armour_master(3, 6, Factions.City.id)
    armour_master(3, 8, Factions.City.id)

    bone_carver_weapon(1, 5, Factions.City.id)
}

function alchemists() {
    alchemist(1, 5, Factions.Mages.id)
    alchemist(1, 6, Factions.Mages.id)
    alchemist(2, 6, Factions.Mages.id)
    alchemist(2, 7, Factions.Mages.id)
}

function shoemakers() {
    shoemaker(0, 3, Factions.City.id)
    shoemaker(2, 4, Factions.City.id)
    shoemaker(3, 3, Factions.City.id)
    shoemaker(3, 6, Factions.City.id)
}

function monk() {
    unarmed_master(7, 5, Factions.Steppes.id)
}

function mages_and_foreign_trader() {
    blood_mage(10, 8, Factions.Steppes.id)
    
}

let version = get_version()
console.log(version)

migrate(version, constants.version)

Data.save()