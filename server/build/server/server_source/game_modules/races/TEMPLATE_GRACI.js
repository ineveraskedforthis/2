"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraciTemplate = void 0;
const generate_name_moraes_1 = require("./generate_name_moraes");
exports.GraciTemplate = {
    model: 'graci',
    ai_map: 'nomad',
    ai_battle: 'basic',
    race: 'graci',
    stats: 'Graci',
    resists: 'Graci',
    name_generator: generate_name,
    max_hp: 'Graci'
};
const graci_moraes = ['O', 'u', 'La', 'Ma', 'a', 'A', 'Ou'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(graci_moraes, 2);
}
