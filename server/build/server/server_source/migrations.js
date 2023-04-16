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
const human_1 = require("./game_modules/races/human");
const data_1 = require("./game_modules/data");
const events_1 = require("./game_modules/events/events");
const inventory_events_1 = require("./game_modules/events/inventory_events");
const market_1 = require("./game_modules/events/market");
const factions_1 = require("./game_modules/factions");
const items_set_up_1 = require("./game_modules/items/items_set_up");
const system_1 = require("./game_modules/items/system");
const materials_manager_1 = require("./game_modules/manager_classes/materials_manager");
const system_2 = require("./game_modules/map/system");
const constants_1 = require("./game_modules/static_data/constants");
const systems_communication_1 = require("./game_modules/systems_communication");
const templates_1 = require("./game_modules/templates");
const LUMP_OF_MONEY = 1000;
const TONS_OF_MONEY = 30000;
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
    console.log('set version ' + n);
    (0, fs_1.writeFileSync)(version_path, '' + n);
    return n;
}
exports.set_version = set_version;
function get_version() {
    let data = Number(get_version_raw());
    return data;
}
function migrate(current_version, target_version) {
    system_2.MapSystem.load();
    data_1.Data.load();
    console.log('migration from ' + current_version + ' to ' + target_version);
    if (current_version == 0) {
        set_up_initial_data();
        current_version = 1;
    }
    if (current_version == 1) {
        create_starting_agents();
        set_version(2);
        current_version = 2;
    }
    if (current_version == 2) {
        set_up_cooks();
        set_version(3);
        current_version = 3;
    }
    if (current_version == 3) {
        set_up_guards_1();
        set_version(4);
        current_version = 4;
    }
    if (current_version == 4) {
        cancel_cook_orders();
        set_version(5);
        current_version = 5;
    }
    if (current_version == 5) {
        misc_characters();
        set_version(6);
        current_version = 6;
    }
    if (current_version == 6) {
        fix_factions();
        set_version(7);
        current_version = 7;
    }
    if (current_version == 7) {
        more_crafters();
        set_version(8);
        current_version = 8;
    }
    if (current_version == 8) {
        alchemists();
        set_version(9);
        current_version = 9;
    }
    if (current_version == 9) {
        shoemakers();
        set_version(10);
        current_version = 10;
    }
    if (current_version == 10) {
        monk();
        set_version(11);
        current_version = 11;
    }
    if (current_version == 11) {
        rat_hunter(7, 5);
        set_version(12);
        current_version = 12;
    }
    if (current_version == 12) {
        current_version = set_version(13);
    }
    if (current_version == 13) {
        let cell = system_2.MapSystem.coordinate_to_id(7, 5);
        let building = {
            cell_id: cell,
            durability: 100,
            tier: 3,
            rooms: 4,
            kitchen: 100,
            workshop: 0,
            is_inn: true,
            room_cost: 5
        };
        let building_id = data_1.Data.Buildings.create(building);
        let innkeeper = events_1.Event.new_character(human_1.HumanTemplate, 'Innkeeper', cell, undefined);
        innkeeper.savings.inc(500);
        data_1.Data.Buildings.set_ownership(innkeeper.id, building_id);
        current_version = set_version(14);
    }
    if (current_version == 14) {
        let cell = system_2.MapSystem.coordinate_to_id(7, 5);
        let trader = events_1.Event.new_character(human_1.Trader, "Trader", cell, undefined);
        trader.savings.inc(800);
        current_version = set_version(15);
    }
    // if (current_version == 12) {
    //     rat_hunter(7, 5)
    //     set_version(12)
    //     current_version = 12
    // }
}
exports.migrate = migrate;
function set_up_initial_data() {
    set_version(1);
}
function create_starting_agents() {
    system_2.MapSystem.load();
    data_1.Data.load();
    const RatsStartingCell = system_2.MapSystem.coordinate_to_id(6, 5);
    const GraciStartingCell = system_2.MapSystem.coordinate_to_id(15, 8);
    const EloStartingCell = system_2.MapSystem.coordinate_to_id(18, 4);
    const dummy_model = { chin: 0, mouth: 0, eyes: 0 };
    for (let i = 1; i < 60; i++) {
        templates_1.Template.Character.GenericRat(6, 5, undefined);
    }
    for (let i = 1; i < 20; i++) {
        templates_1.Template.Character.Graci(15, 8, undefined);
    }
    for (let i = 1; i < 30; i++) {
        templates_1.Template.Character.Elo(18, 4, undefined);
    }
    /// test person
    const starting_cell_colony = system_2.MapSystem.coordinate_to_id(0, 3);
    {
        let Trader = events_1.Event.new_character(human_1.HumanTemplate, 'Trader', starting_cell_colony, dummy_model);
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
        const spear = system_1.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
        spear.affixes.push({ 'tag': 'sharp' });
        const index = inventory_events_1.EventInventory.add_item(Trader, spear);
        market_1.EventMarket.sell_item(Trader, index, 50);
    }
    // let monk =  this.create_new_character(pool, 'Old monk', this.get_cell_id_by_x_y(7, 5), -1)
    // monk.skills.noweapon = 100
    // monk.learn_perk("advanced_unarmed")
    // monk.faction_id = 3
    // monk.changed = true    
}
const dummy_model = { chin: 0, mouth: 0, eyes: 0 };
function create_cook(x, y) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    const cook = events_1.Event.new_character(human_1.HumanTemplate, 'Local cook', cell, dummy_model);
    cook.stash.inc(materials_manager_1.FOOD, 10);
    cook.savings.inc(500);
    cook.skills.cooking = 100;
    cook.perks.meat_master = true;
    return cook;
}
function create_guard(x, y) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let spearman = events_1.Event.new_character(human_1.HumanTemplate, 'Local militia', cell, dummy_model);
    spearman.skills.polearms = 100;
    spearman.perks.advanced_polearm = true;
    let spear = system_1.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
    let armour = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT);
    spearman.equip.data.weapon = spear;
    spearman.equip.data.armour.body = armour;
    let index = inventory_events_1.EventInventory.add_item(spearman, spear);
    inventory_events_1.EventInventory.equip_from_backpack(spearman, index);
    return spearman;
}
function rat_hunter(x, y) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let spearman = events_1.Event.new_character(human_1.RatHunterHuman, 'Rat hunter', cell, dummy_model);
    spearman.skills.polearms = 100;
    spearman.perks.advanced_polearm = true;
    let spear = system_1.ItemSystem.create(items_set_up_1.BONE_SPEAR_ARGUMENT);
    spear.durability = 200;
    let armour = system_1.ItemSystem.create(items_set_up_1.RAT_SKIN_ARMOUR_ARGUMENT);
    spearman.equip.data.weapon = spear;
    spearman.equip.data.armour.body = armour;
    spearman.archetype.ai_map = 'rat_hunter';
    data_1.Data.CharacterDB.save();
    // let index = EventInventory.add_item(spearman, spear)
    // EventInventory.equip_from_backpack(spearman, index)
}
function fletcher(x, y) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let fletcher = events_1.Event.new_character(human_1.HumanTemplate, 'Fletcher', cell, dummy_model);
    fletcher.skills.woodwork = 100;
    fletcher.perks.fletcher = true;
    fletcher.skills.ranged = 30;
    fletcher.stash.inc(materials_manager_1.ARROW_BONE, 50);
    fletcher.stash.inc(materials_manager_1.RAT_BONE, 3);
    fletcher.stash.inc(materials_manager_1.WOOD, 1);
    fletcher.savings.inc(LUMP_OF_MONEY);
    return fletcher;
}
function mage(x, y) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let mage = events_1.Event.new_character(human_1.HumanTemplate, 'Mage', cell, dummy_model);
    mage.skills.magic_mastery = 100;
    mage.perks.mage_initiation = true;
    mage.perks.magic_bolt = true;
    mage.stash.inc(materials_manager_1.ZAZ, 300);
    mage.savings.inc(TONS_OF_MONEY);
    market_1.EventMarket.sell(mage, materials_manager_1.ZAZ, 200, 50);
    market_1.EventMarket.buy(mage, materials_manager_1.ELODINO_FLESH, 200, 20);
    market_1.EventMarket.buy(mage, materials_manager_1.GRACI_HAIR, 10, 1000);
    return mage;
}
function blood_mage(x, y, faction_id) {
    const blood_mage = mage(x, y);
    blood_mage.perks.blood_mage = true;
    data_1.Data.Reputation.set(faction_id, blood_mage.id, "member");
    return blood_mage;
}
function alchemist(x, y, faction_id) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let alchemist = events_1.Event.new_character(human_1.HumanTemplate, 'Alchemist', cell, dummy_model);
    alchemist.skills.magic_mastery = 60;
    alchemist.perks.mage_initiation = true;
    alchemist.perks.alchemist = true;
    alchemist.stash.inc(materials_manager_1.ZAZ, 5);
    alchemist.savings.inc(TONS_OF_MONEY);
    data_1.Data.Reputation.set(faction_id, alchemist.id, "member");
    return alchemist;
}
function armour_master(x, y, faction_id) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let master = events_1.Event.new_character(human_1.HumanTemplate, 'Armourer', cell, dummy_model);
    master.skills.clothier = 100;
    master.perks.skin_armour_master = true;
    master.stash.inc(materials_manager_1.RAT_SKIN, 50);
    master.savings.inc(LUMP_OF_MONEY);
    data_1.Data.Reputation.set(faction_id, master.id, "member");
    return master;
}
function shoemaker(x, y, faction_id) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let master = events_1.Event.new_character(human_1.HumanTemplate, 'Shoemaker', cell, dummy_model);
    master.skills.clothier = 100;
    master.perks.shoemaker = true;
    master.stash.inc(materials_manager_1.RAT_SKIN, 50);
    master.savings.inc(LUMP_OF_MONEY);
    data_1.Data.Reputation.set(faction_id, master.id, "member");
    return master;
}
function weapon_master_wood(x, y, faction_id) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let master = events_1.Event.new_character(human_1.HumanTemplate, 'Weapons maker', cell, dummy_model);
    master.skills.woodwork = 100;
    master.perks.weapon_maker = true;
    master.stash.inc(materials_manager_1.WOOD, 15);
    master.savings.inc(LUMP_OF_MONEY);
    data_1.Data.Reputation.set(faction_id, master.id, "member");
    return master;
}
function bone_carver_weapon(x, y, faction_id) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let master = events_1.Event.new_character(human_1.HumanTemplate, 'Weapons maker', cell, dummy_model);
    master.skills.bone_carving = 100;
    master.perks.weapon_maker = true;
    master.stash.inc(materials_manager_1.RAT_BONE, 40);
    master.savings.inc(LUMP_OF_MONEY);
    data_1.Data.Reputation.set(faction_id, master.id, "member");
    return master;
}
function unarmed_master(x, y, faction_id) {
    const cell = system_2.MapSystem.coordinate_to_id(x, y);
    let master = events_1.Event.new_character(human_1.HumanTemplate, 'Monk', cell, dummy_model);
    master.skills.noweapon = 100;
    master.perks.dodge = true;
    master.perks.advanced_unarmed = true;
    master.savings.inc(LUMP_OF_MONEY);
    data_1.Data.Reputation.set(faction_id, master.id, "member");
    return master;
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
    for (let character of data_1.Data.CharacterDB.list()) {
        if (character.name != 'Trader') {
            market_1.EventMarket.clear_orders(character);
        }
    }
}
function misc_characters() {
    const fletcher_city = fletcher(3, 3);
    data_1.Data.Reputation.set(factions_1.Factions.City.id, fletcher_city.id, "member");
    const fletcher_city_south = fletcher(3, 6);
    data_1.Data.Reputation.set(factions_1.Factions.City.id, fletcher_city_south.id, "member");
    const fletcher_forest = fletcher(7, 5);
    data_1.Data.Reputation.set(factions_1.Factions.Steppes.id, fletcher_forest.id, "member");
    const mage_city = mage(1, 6);
    data_1.Data.Reputation.set(factions_1.Factions.Mages.id, mage_city.id, "friend");
    data_1.Data.Reputation.set(factions_1.Factions.Mages.id, mage_city.id, "member");
    armour_master(0, 3, factions_1.Factions.City.id);
}
function fix_factions() {
    const EloStartingCell = system_2.MapSystem.coordinate_to_cell([18, 4]);
    for (let character of data_1.Data.CharacterDB.list()) {
        if (character.race() == 'elo') {
            data_1.Data.Reputation.set(factions_1.Factions.Elodinos.id, character.id, "member");
            if (systems_communication_1.Convert.character_to_cell(character).development.wild == 0) {
                events_1.Event.move(character, EloStartingCell);
            }
        }
        if (character.race() == 'graci') {
            data_1.Data.Reputation.set(factions_1.Factions.Graci.id, character.id, "member");
        }
    }
}
function more_crafters() {
    weapon_master_wood(0, 3, factions_1.Factions.City.id);
    weapon_master_wood(3, 4, factions_1.Factions.City.id);
    weapon_master_wood(3, 6, factions_1.Factions.City.id);
    weapon_master_wood(0, 7, factions_1.Factions.City.id);
    armour_master(3, 6, factions_1.Factions.City.id);
    armour_master(3, 8, factions_1.Factions.City.id);
    bone_carver_weapon(1, 5, factions_1.Factions.City.id);
}
function alchemists() {
    alchemist(1, 5, factions_1.Factions.Mages.id);
    alchemist(1, 6, factions_1.Factions.Mages.id);
    alchemist(2, 6, factions_1.Factions.Mages.id);
    alchemist(2, 7, factions_1.Factions.Mages.id);
}
function shoemakers() {
    shoemaker(0, 3, factions_1.Factions.City.id);
    shoemaker(2, 4, factions_1.Factions.City.id);
    shoemaker(3, 3, factions_1.Factions.City.id);
    shoemaker(3, 6, factions_1.Factions.City.id);
}
function monk() {
    unarmed_master(7, 5, factions_1.Factions.Steppes.id);
}
function mages_and_foreign_trader() {
    blood_mage(10, 8, factions_1.Factions.Steppes.id);
}
let version = get_version();
console.log(version);
migrate(version, constants_1.constants.version);
data_1.Data.save();
