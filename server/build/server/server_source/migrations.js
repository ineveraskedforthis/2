"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = exports.set_version = void 0;
const path = __importStar(require("path"));
const fs_1 = require("fs");
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
const constants_1 = require("./game_modules/static_data/constants");
var SAVE_GAME_PATH = path.join('save_1');
if (!(0, fs_1.existsSync)(SAVE_GAME_PATH)) {
    (0, fs_1.mkdirSync)(SAVE_GAME_PATH);
}
console.log(SAVE_GAME_PATH);
const version_path = path.join(SAVE_GAME_PATH, 'version.txt');
function get_version_raw() {
    if (!(0, fs_1.existsSync)(version_path)) {
        (0, fs_1.writeFileSync)(version_path, '');
    }
    return (0, fs_1.readFileSync)(version_path).toString();
}
function set_version(n) {
    (0, fs_1.writeFileSync)(version_path, '' + n);
}
exports.set_version = set_version;
function get_version() {
    let data = Number(get_version_raw());
    return data;
}
function migrate(current_version, target_version) {
    system_1.CharacterSystem.load();
    system_3.MapSystem.load();
    data_1.Data.load();
    console.log('migration from ' + current_version + ' to ' + target_version);
    if (current_version == 0) {
        set_up_initial_data();
    }
    if (current_version == 1) {
        create_starting_agents();
        set_version(2);
    }
    if (current_version == 2) {
        set_up_cooks();
        set_version(3);
    }
    if (current_version == 3) {
        set_up_guards_1();
        set_version(4);
    }
    if (current_version == 4) {
        cancel_cook_orders();
        set_version(5);
    }
}
exports.migrate = migrate;
function set_up_initial_data() {
    set_version(1);
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
}
const dummy_model = { chin: 0, mouth: 0, eyes: 0 };
function create_cook(x, y) {
    const cell = system_3.MapSystem.coordinate_to_id(x, y);
    const cook = events_1.Event.new_character(human_1.HumanTemplateColony, 'Local cook', cell, dummy_model);
    cook.stash.inc(materials_manager_1.FOOD, 10);
    cook.savings.inc(500);
    cook.skills.cooking = 100;
    cook.perks.meat_master = true;
    return cook;
}
function create_guard(x, y) {
    const cell = system_3.MapSystem.coordinate_to_id(x, y);
    let spearman = events_1.Event.new_character(human_1.HumanTemplateColony, 'Local militia', cell, dummy_model);
    spearman.skills.polearms = 100;
    spearman.perks.advanced_polearm = true;
    let spear = system_2.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
    let armour = system_2.ItemSystem.create(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT);
    spearman.equip.data.weapon = spear;
    spearman.equip.data.armour.body = armour;
    return spearman;
}
function fletcher(x, y) {
    const cell = system_3.MapSystem.coordinate_to_id(x, y);
    let fletcher = events_1.Event.new_character(human_1.HumanTemplateColony, 'Fletcher', cell, dummy_model);
    fletcher.skills.woodwork = 100;
    fletcher.perks.fletcher = true;
    fletcher.skills.ranged = 30;
    fletcher.stash.inc(materials_manager_1.ARROW_BONE, 50);
    fletcher.stash.inc(materials_manager_1.RAT_BONE, 3);
    fletcher.stash.inc(materials_manager_1.WOOD, 1);
    fletcher.savings.inc(1000);
}
function city_guard(x, y) {
    let guard = create_guard(x, y);
    data_1.Data.Reputation.set(factions_1.Factions.City.id, guard.id, "member");
}
function set_up_cooks() {
    let cook_forest = create_cook(7, 5);
    data_1.Data.Reputation.set(factions_1.Factions.Steppes.id, cook_forest.id, "member");
    let cook_port = create_cook(0, 3);
    data_1.Data.Reputation.set(factions_1.Factions.City.id, cook_port.id, "member");
    let cook_port2 = create_cook(3, 8);
    data_1.Data.Reputation.set(factions_1.Factions.City.id, cook_port2.id, "member");
    let cook_port3 = create_cook(1, 6);
    data_1.Data.Reputation.set(factions_1.Factions.City.id, cook_port3.id, "member");
}
function set_up_guards_1() {
    let guard_forest = create_guard(7, 5);
    data_1.Data.Reputation.set(factions_1.Factions.Steppes.id, guard_forest.id, "member");
    city_guard(0, 3);
    city_guard(0, 3);
    city_guard(3, 8);
    city_guard(1, 6);
    city_guard(3, 5);
    city_guard(1, 3);
    city_guard(2, 5);
    city_guard(0, 4);
}
function cancel_cook_orders() {
    console.log('cancelling orders of cooks');
    for (let character of data_1.Data.Character.list()) {
        if (character.name != 'Trader') {
            market_1.EventMarket.clear_orders(character);
        }
    }
}
let version = get_version();
console.log(version);
migrate(version, constants_1.constants.version);
system_1.CharacterSystem.save();
data_1.Data.save();
