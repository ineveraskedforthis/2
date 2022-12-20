"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraciTemplate = void 0;
const damage_types_1 = require("../../misc/damage_types");
const templates_1 = require("../templates");
const generate_name_moraes_1 = require("./generate_name_moraes");
const GraciArchetype = {
    model: 'graci',
    ai_map: 'steppe_walker_passive',
    ai_battle: 'basic',
    race: 'graci'
};
const GraciStats = {
    phys_power: 50,
    magic_power: 5,
    movement_speed: 3
};
const GraciResists = new damage_types_1.Damage(0, 0, 0, 0);
const graci_moraes = ['O', 'u', 'La', 'Ma', 'a', 'A', 'Ou'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(graci_moraes, 2);
}
exports.GraciTemplate = new templates_1.CharacterTemplate(GraciArchetype, generate_name, 1000, GraciStats, GraciResists);
