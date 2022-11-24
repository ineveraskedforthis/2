import { set_version } from "./game_launch"
import { EloTemplate } from "./game_modules/character/races/elo"
import { GraciTemplate } from "./game_modules/character/races/graci"
import { HumanTemplateColony } from "./game_modules/character/races/human"
import { RatTemplate } from "./game_modules/character/races/rat"
import { CharacterSystem } from "./game_modules/character/system"
import { Data } from "./game_modules/data"
import { Event } from "./game_modules/events/events"
import { EventInventory } from "./game_modules/events/inventory_events"
import { EventMarket } from "./game_modules/events/market"
import { Factions } from "./game_modules/factions"
import { BONE_SPEAR_ARGUMENT } from "./game_modules/items/items_set_up"
import { ItemSystem } from "./game_modules/items/system"
import { ELODINO_FLESH, FOOD, MEAT, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "./game_modules/manager_classes/materials_manager"
import { MapSystem } from "./game_modules/map/system"
import { money } from "./game_modules/types"

export function migrate(current_version:number, target_version:number) {
    console.log('migration from ' + current_version  + ' to ' + target_version)
    if (current_version == 0) {
        set_up_initial_data()
    } 

    if (current_version == 1) {
        create_starting_agents()
    }

    if (current_version == 2) {
        
    }
}

function set_up_initial_data() {
    set_version(1)
}

function create_starting_agents() {
    

    MapSystem.load()
    CharacterSystem.load()

    const RatsStartingCell = MapSystem.coordinate_to_id(6, 5)
    const GraciStartingCell = MapSystem.coordinate_to_id(15, 8)
    const EloStartingCell = MapSystem.coordinate_to_id(18, 10)

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
        let Trader = Event.new_character(HumanTemplateColony, 'Trader', starting_cell_colony, dummy_model)
                
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


    // let armour_master =  this.create_new_character(pool, 'Armour master', starting_cell_id, -1)
    // armour_master.skills.clothier = 100
    // armour_master.skills.perks.skin_armour_master = true
    // armour_master.stash.inc(RAT_SKIN, 40)
    // armour_master.savings.inc(1000 as money)
    // armour_master.faction_id = 3


    // let monk =  this.create_new_character(pool, 'Old monk', this.get_cell_id_by_x_y(7, 5), -1)
    // monk.skills.noweapon = 100
    // monk.learn_perk("advanced_unarmed")
    // monk.faction_id = 3
    // monk.changed = true


    

    // let fletcher =  this.create_new_character(pool, 'Fletcher', this.get_cell_id_by_x_y(3, 3), -1)
    // fletcher.stash.inc(ARROW_BONE, 20)
    // fletcher.savings.inc(1000 as money)
    // fletcher.learn_perk('fletcher')
    // fletcher.changed = true
    // fletcher.faction_id = 3

    // let spearman =  this.create_new_character(pool, 'Spearman', this.get_cell_id_by_x_y(3, 6), -1)
    // spearman.skills.polearms = 100
    // spearman.learn_perk("advanced_polearm")
    // let spear = new Weapon(BONE_SPEAR_ARGUMENT)
    // spearman.equip.data.weapon = spear
    // spearman.changed = true
    // spearman.faction_id = 3
    

    // let meat_bag =  this.create_new_character(pool, 'Meat Bag', this.get_cell_id_by_x_y(0, 3), -1)
    // meat_bag.stash.inc(MEAT, 200)
    //     meat_bag.sell(pool, MEAT, 10, 10 as money)
    // if (nodb_mode_check()) {meat_bag.change_hp(-99)}
    // meat_bag.faction_id = 3

    // let mage =  this.create_new_character(pool, 'Mage', this.get_cell_id_by_x_y(1, 5), -1)
    // mage.skills.magic_mastery = 100
    // mage.learn_perk('mage_initiation')
    // mage.learn_perk('magic_bolt')
    // mage.stash.inc(ZAZ, 300)
    // mage.savings.inc(30000 as money)
    //     mage.sell(pool, ZAZ, 200, 50 as money)
    //     mage.buy(pool, ELODINO_FLESH, 200, 50 as money)
    //     mage.buy(pool, GRACI_HAIR, 10, 1000 as money)
    // mage.changed = true
    // mage.faction_id = 3

    set_version(2)
}

const dummy_model = {chin: 0, mouth: 0, eyes: 0}
function create_cook(x: number, y: number) {
    const cell = MapSystem.coordinate_to_id(x, y)
    const cook =  Event.new_character(HumanTemplateColony, 'Trader', cell, dummy_model)
}

function set_up_cooks() {
    

    // let cook =  this.create_new_character(pool, 'Cook', starting_cell_id, -1)
    // cook.learn_perk("meat_master")
    // cook.skills.cooking = 100
    // cook.stash.inc(FOOD, 10)
    // cook.savings.inc(500 as money)
    // cook.faction_id = 3
    // //  cook.sell(pool, FOOD, 500, 10 as money)
    
    // let forest_cook =  this.create_new_character(pool, 'Old cook', this.get_cell_id_by_x_y(7, 5), -1)
    // forest_cook.stash.inc(FOOD, 10)
    // forest_cook.savings.inc(500 as money)
    // forest_cook.skills.cooking = 100
    // forest_cook.learn_perk("meat_master")
    // forest_cook.faction_id = 3
}