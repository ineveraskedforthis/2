"use strict";
// import * as path from "path";
// import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
// import { EloTemplate } from "./game_modules/races/elo"
// import { GraciTemplate } from "./game_modules/races/graci"
// import { HumanTemplate, RatHunterHuman, Trader } from "./game_modules/races/human"
// import { RatTemplate } from "./game_modules/races/rat"
// import { CharacterSystem } from "./game_modules/character/system"
// import { Data } from "./game_modules/data"
// import { Event } from "./game_modules/events/events"
// import { EventInventory } from "./game_modules/events/inventory_events"
// import { EventMarket } from "./game_modules/events/market"
// import { Factions } from "./game_modules/factions"
// import { BONE_SPEAR_ARGUMENT, RAT_SKIN_ARMOUR_ARGUMENT } from "./game_modules/items/items_set_up"
// import { ItemSystem } from "./game_modules/items/system"
// import { ARROW_BONE, ELODINO_FLESH, FOOD, GRACI_HAIR, MEAT, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "./game_modules/manager_classes/materials_manager"
// import { MapSystem } from "./game_modules/map/system"
// import { money } from "./game_modules/types"
// import { constants } from "./game_modules/static_data/constants";
// import { Convert } from "./game_modules/systems_communication";
// import { Cell } from "./game_modules/map/cell";
// import { Location, LocationType } from "./game_modules/DATA_LAYOUT_BUILDING";
// import { Stash } from "./game_modules/inventories/stash";
// import { Savings } from "./game_modules/inventories/savings";
// import { Template } from "./game_modules/templates";
// export function migrate(current_version:number, target_version:number) {
//     MapSystem.load()
//     Data.load()
//     console.log('migration from ' + current_version  + ' to ' + target_version)
//     if (current_version == 0) {
//         set_up_initial_data()
//         current_version = 1
//     }
//     if (current_version == 1) {
//         create_starting_agents()
//         set_version(2)
//         current_version = 2
//     }
//     if (current_version == 2) {
//         set_up_cooks()
//         set_version(3)
//         current_version = 3
//     }
//     if (current_version == 3) {
//         set_up_guards_1()
//         set_version(4)
//         current_version = 4
//     }
//     if (current_version == 4) {
//         cancel_cook_orders()
//         set_version(5)
//         current_version = 5
//     }
//     if (current_version == 5) {
//         misc_characters()
//         set_version(6)
//         current_version = 6
//     }
//     if (current_version == 6) {
//         fix_factions()
//         set_version(7)
//         current_version = 7
//     }
//     if (current_version == 7) {
//         more_crafters()
//         set_version(8)
//         current_version = 8
//     }
//     if (current_version == 8) {
//         alchemists()
//         set_version(9)
//         current_version = 9
//     }
//     if (current_version == 9) {
//         shoemakers()
//         set_version(10)
//         current_version = 10
//     }
//     if (current_version == 10) {
//         monk()
//         set_version(11)
//         current_version = 11
//     }
//     if (current_version == 11) {
//         Template.Character.HumanRatHunter(7, 5, "Rat Hunter")
//         set_version(12)
//         current_version = 12
//     }
//     if (current_version == 12) {
//         current_version = set_version(13)
//     }
//     if (current_version == 13) {
//         let cell = MapSystem.coordinate_to_id(7, 5)
//         let location:Location = {
//             cell_id: cell,
//             durability: 100,
//             type: LocationType.Inn,
//             rooms: 4,
//             // kitchen: 100,
//             // workshop: 0,
//             room_cost: 5 as money
//         }
//         let location_id = Data.Locations.create(location)
//         let innkeeper = Event.new_character(HumanTemplate, 'Innkeeper', cell, undefined)
//         innkeeper.savings.inc(500 as money)
//         Data.Locations.set_ownership(innkeeper.id, location_id)
//         current_version = set_version(14)
//     }
//     if (current_version == 14) {
//         let cell = MapSystem.coordinate_to_id(7, 5)
//         let trader = Event.new_character(Trader, "Trader", cell, undefined)
//         trader.savings.inc(800 as money)
//         current_version = set_version(15)
//     }
//     // if (current_version == 12) {
//     //     rat_hunter(7, 5)
//     //     set_version(12)
//     //     current_version = 12
//     // }
// }
// function set_up_initial_data() {
//     set_version(1)
// }
// function create_starting_agents() {
//     MapSystem.load()
//     Data.load()
//     const RatsStartingCell = MapSystem.coordinate_to_id([6, 5])
//     const GraciStartingCell = MapSystem.coordinate_to_id([15, 8])
//     const EloStartingCell = MapSystem.coordinate_to_id([18, 4])
//     const dummy_model = {chin: 0, mouth: 0, eyes: 0}
//     // for (let i = 1; i < 60; i++) {
//     //     Template.Character.GenericRat(6, 5, undefined)
//     // }
//     for (let i = 1; i < 20; i++) {
//         Template.Character.Graci(15, 8, undefined)
//     }
//     for (let i = 1; i < 30; i++) {
//         Template.Character.Elo(18, 4, undefined)
//     }
//     /// test person
//     const starting_cell_colony = MapSystem.coordinate_to_id(0, 3)
//     {
//         let Trader = Event.new_character(HumanTemplate, 'Trader', starting_cell_colony, dummy_model)
//         Trader.stash.inc(MEAT, 10)
//         Trader.stash.inc(WOOD, 100)
//         Trader.stash.inc(FOOD, 500)
//         Trader.stash.inc(RAT_BONE, 100)
//         Trader.stash.inc(WOOD, 100)
//         Trader.stash.inc(RAT_SKIN, 100)
//         Trader.stash.inc(ZAZ, 100)
//         Trader.stash.inc(ELODINO_FLESH, 100)
//         Trader.savings.set(5000 as money)
//         Data.Reputation.set(Factions.City.id, Trader.id, 'member')
//         EventMarket.buy(Trader, MEAT, 200, 5 as money)
//         EventMarket.sell(Trader, FOOD, 200, 15 as money)
//         EventMarket.sell(Trader, ZAZ, 100, 200 as money)
//         const spear = ItemSystem.create(BONE_SPEAR_ARGUMENT)
//         spear.affixes.push({'tag': 'sharp'})
//         const index = EventInventory.add_item(Trader, spear)
//         EventMarket.sell_item(Trader, index, 50 as money)
//     }
//     // let monk =  this.create_new_character(pool, 'Old monk', this.get_cell_id_by_x_y(7, 5), -1)
//     // monk.skills.noweapon = 100
//     // monk.learn_perk("advanced_unarmed")
//     // monk.faction_id = 3
//     // monk.changed = true
// }
// const dummy_model = {chin: 0, mouth: 0, eyes: 0}
// function city_guard(x: number, y: number) {
//     Template.Character.HumanCityGuard(x, y, 'Guard')
// }
// function set_up_cooks() {
//     Template.Character.HumanCook(7, 5, 'Cook', 'steppe')
//     Template.Character.HumanCook(0, 3, 'Cook', 'city')
//     Template.Character.HumanCook(3, 8, 'Cook', 'city')
//     Template.Character.HumanCook(1, 6, 'Cook', 'city')
// }
// function set_up_guards_1() {
//     Template.Character.HumanSpearman(7, 5, 'Guard', 'steppe')
//     city_guard(0, 3)
//     city_guard(0, 3)
//     city_guard(3, 8)
//     city_guard(1, 6)
//     city_guard(3, 5)
//     city_guard(1, 3)
//     city_guard(2, 5)
//     city_guard(0, 4)
// }
// function cancel_cook_orders() {
//     console.log('cancelling orders of cooks')
//     for (let character of Data.CharacterDB.list()) {
//         if (character.get_name() != 'Trader') {
//             EventMarket.clear_orders(character)
//         }
//     }
// }
// function misc_characters() {
//     Template.Character.HumanFletcher(3, 3, 'Fletcher', 'city')
//     Template.Character.HumanFletcher(3, 6, 'Fletcher', 'city')
//     Template.Character.HumanFletcher(7, 5, 'Fletcher', 'steppe')
//     const mage_city = mage(1, 6)
//     Data.Reputation.set(Factions.Mages.id, mage_city.id, "friend")
//     Data.Reputation.set(Factions.Mages.id, mage_city.id, "member")
//     armour_master(0, 3, Factions.City.id)
// }
// function fix_factions() {
//     const EloStartingCell = MapSystem.coordinate_to_id([18, 4])
//     for (let character of Data.CharacterDB.list()) {
//         if (character.race == 'elo') {
//             Data.Reputation.set(Factions.Elodinos.id, character.id, "member")
//             // if (Convert.character_to_cell(character).development.wild == 0) {
//                 Event.move(character, EloStartingCell as Cell)
//             // }
//         }
//         if (character.race == 'graci') {
//             Data.Reputation.set(Factions.Graci.id, character.id, "member")
//         }
//     }
// }
// function more_crafters() {
//     weapon_master_wood(0, 3, Factions.City.id)
//     weapon_master_wood(3, 4, Factions.City.id)
//     weapon_master_wood(3, 6, Factions.City.id)
//     weapon_master_wood(0, 7, Factions.City.id)
//     armour_master(3, 6, Factions.City.id)
//     armour_master(3, 8, Factions.City.id)
//     bone_carver_weapon(1, 5, Factions.City.id)
// }
// function alchemists() {
//     alchemist(1, 5, Factions.Mages.id)
//     alchemist(1, 6, Factions.Mages.id)
//     alchemist(2, 6, Factions.Mages.id)
//     alchemist(2, 7, Factions.Mages.id)
// }
// function shoemakers() {
//     shoemaker(0, 3, Factions.City.id)
//     shoemaker(2, 4, Factions.City.id)
//     shoemaker(3, 3, Factions.City.id)
//     shoemaker(3, 6, Factions.City.id)
// }
// function monk() {
//     unarmed_master(7, 5, Factions.Steppes.id)
// }
// function mages_and_foreign_trader() {
//     blood_mage(10, 8, Factions.Steppes.id)
// }
// let version = get_version()
// console.log(version)
// migrate(version, constants.version)
// Data.save()

