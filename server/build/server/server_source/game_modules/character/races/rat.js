"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MageRatTemplate = exports.BigRatTemplate = exports.RatTemplate = void 0;
const damage_types_1 = require("../../misc/damage_types");
const templates_1 = require("../templates");
const generate_name_moraes_1 = require("./generate_name_moraes");
const RatArchetype = {
    model: 'rat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
};
const BigRatArchetype = {
    model: 'bigrat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
};
const MageRatArchetype = {
    model: 'magerat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
};
const RatStats = {
    phys_power: 15,
    magic_power: 20,
    movement_speed: 2
};
const BigRatStats = {
    phys_power: 30,
    magic_power: 20,
    movement_speed: 1
};
const RatResists = new damage_types_1.Damage(5, 5, 5, 20);
const rat_moraes = ['s', 'shi', "S'", "fu", 'fi'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(rat_moraes, 5);
}
exports.RatTemplate = new templates_1.CharacterTemplate(RatArchetype, generate_name, 50, RatStats, RatResists);
exports.BigRatTemplate = new templates_1.CharacterTemplate(BigRatArchetype, generate_name, 150, BigRatStats, RatResists);
exports.MageRatTemplate = new templates_1.CharacterTemplate(MageRatArchetype, generate_name, 20, RatStats, RatResists);













































