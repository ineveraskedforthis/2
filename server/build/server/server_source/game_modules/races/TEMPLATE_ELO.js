"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElodinoTemplate = void 0;
const generate_name_moraes_1 = require("./generate_name_moraes");
const elo_moraes = ['xi', 'lo', 'mi', 'ki', 'a', 'i', 'ku'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(elo_moraes, 3);
}
exports.ElodinoTemplate = {
    model: 'elo',
    ai_map: 'forest_walker',
    ai_battle: 'basic',
    race: 'elo',
    stats: "Elodino",
    resists: "Elodino",
    name_generator: generate_name,
    max_hp: "Elodino",
};
