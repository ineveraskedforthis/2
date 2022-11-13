"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
const game_launch_1 = require("./game_launch");
const elo_1 = require("./game_modules/character/races/elo");
const graci_1 = require("./game_modules/character/races/graci");
const human_1 = require("./game_modules/character/races/human");
const rat_1 = require("./game_modules/character/races/rat");
const system_1 = require("./game_modules/character/system");
const data_1 = require("./game_modules/data");
const events_1 = require("./game_modules/events/events");
const inventory_events_1 = require("./game_modules/events/inventory_events");
const market_1 = require("./game_modules/events/market");
const factions_1 = require("./game_modules/factions");
const items_set_up_1 = require("./game_modules/items/items_set_up");
const system_2 = require("./game_modules/items/system");
const materials_manager_1 = require("./game_modules/manager_classes/materials_manager");
const system_3 = require("./game_modules/map/system");
function migrate(current_version, target_version) {
    console.log('migration from ' + current_version + ' to ' + target_version);
    if (current_version == 0) {
        set_up_initial_data();
    }
    if (current_version == 1) {
        create_starting_agents();
    }
}
exports.migrate = migrate;
function set_up_initial_data() {
    (0, game_launch_1.set_version)(1);
}
function create_starting_agents() {
    system_3.MapSystem.load();
    system_1.CharacterSystem.load();
    const RatsStartingCell = system_3.MapSystem.coordinate_to_id(6, 5);
    const GraciStartingCell = system_3.MapSystem.coordinate_to_id(15, 8);
    const EloStartingCell = system_3.MapSystem.coordinate_to_id(18, 10);
    const dummy_model = { chin: 0, mouth: 0, eyes: 0 };
    for (let i = 1; i < 60; i++) {
        events_1.Event.new_character(rat_1.RatTemplate, undefined, RatsStartingCell, dummy_model);
    }
    for (let i = 1; i < 20; i++) {
        events_1.Event.new_character(graci_1.GraciTemplate, undefined, GraciStartingCell, dummy_model);
    }
    for (let i = 1; i < 30; i++) {
        events_1.Event.new_character(elo_1.EloTemplate, undefined, EloStartingCell, dummy_model);
    }
    /// test person
    const starting_cell_colony = system_3.MapSystem.coordinate_to_id(0, 3);
    {
        let Trader = events_1.Event.new_character(human_1.HumanTemplateColony, 'Trader', starting_cell_colony, dummy_model);
        Trader.stash.inc(materials_manager_1.MEAT, 10);
        Trader.stash.inc(materials_manager_1.WOOD, 100);
        Trader.stash.inc(materials_manager_1.FOOD, 500);
        Trader.stash.inc(materials_manager_1.RAT_BONE, 100);
        Trader.stash.inc(materials_manager_1.WOOD, 100);
        Trader.stash.inc(materials_manager_1.RAT_SKIN, 100);
        Trader.stash.inc(materials_manager_1.ZAZ, 100);
        Trader.stash.inc(materials_manager_1.ELODINO_FLESH, 100);
        Trader.savings.set(5000);
        data_1.Data.Reputation.set(factions_1.Factions.City.id, Trader.id, 'member');
        market_1.EventMarket.buy(Trader, materials_manager_1.MEAT, 200, 5);
        market_1.EventMarket.sell(Trader, materials_manager_1.FOOD, 200, 15);
        market_1.EventMarket.sell(Trader, materials_manager_1.ZAZ, 100, 200);
        const spear = system_2.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
        spear.affixes.push({ 'tag': 'sharp' });
        const index = inventory_events_1.EventInventory.add_item(Trader, spear);
        market_1.EventMarket.sell_item(Trader, index, 50);
    }
    // let armour_master =  this.create_new_character(pool, 'Armour master', starting_cell_id, -1)
    // armour_master.skills.clothier = 100
    // armour_master.skills.perks.skin_armour_master = true
    // armour_master.stash.inc(RAT_SKIN, 40)
    // armour_master.savings.inc(1000 as money)
    // armour_master.faction_id = 3
    // let cook =  this.create_new_character(pool, 'Cook', starting_cell_id, -1)
    // cook.learn_perk("meat_master")
    // cook.skills.cooking = 100
    // cook.stash.inc(FOOD, 10)
    // cook.savings.inc(500 as money)
    // cook.faction_id = 3
    // //  cook.sell(pool, FOOD, 500, 10 as money)
    // let monk =  this.create_new_character(pool, 'Old monk', this.get_cell_id_by_x_y(7, 5), -1)
    // monk.skills.noweapon = 100
    // monk.learn_perk("advanced_unarmed")
    // monk.faction_id = 3
    // monk.changed = true
    // let forest_cook =  this.create_new_character(pool, 'Old cook', this.get_cell_id_by_x_y(7, 5), -1)
    // forest_cook.stash.inc(FOOD, 10)
    // forest_cook.savings.inc(500 as money)
    // forest_cook.skills.cooking = 100
    // forest_cook.learn_perk("meat_master")
    // forest_cook.faction_id = 3
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
    (0, game_launch_1.set_version)(2);
}
