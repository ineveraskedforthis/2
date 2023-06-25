"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MageRatTemplate = exports.BerserkRatTemplate = exports.BigRatTemplate = exports.RatTemplate = void 0;
const generate_name_moraes_1 = require("./generate_name_moraes");
exports.RatTemplate = {
    model: 'rat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat',
    stats: "Rat",
    resists: "Rat",
    name_generator: generate_name,
    max_hp: 'Rat'
};
exports.BigRatTemplate = {
    model: 'bigrat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat',
    stats: "BigRat",
    resists: "BigRat",
    name_generator: generate_name,
    max_hp: 'BigRat'
};
exports.BerserkRatTemplate = {
    model: 'berserkrat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat',
    stats: "BerserkRat",
    resists: "BerserkRat",
    name_generator: generate_name,
    max_hp: 'BerserkRat'
};
exports.MageRatTemplate = {
    model: 'magerat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat',
    stats: "MageRat",
    resists: "Rat",
    name_generator: generate_name,
    max_hp: 'MageRat'
};
const rat_moraes = ['s', 'shi', "S'", "fu", 'fi'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(rat_moraes, 5);
}
