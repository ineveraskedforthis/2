"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EloTemplate = void 0;
const damage_types_1 = require("../../misc/damage_types");
const templates_1 = require("../templates");
const generate_name_moraes_1 = require("./generate_name_moraes");
const ElodinoArchetype = {
    model: 'elo',
    ai_map: 'forest_walker',
    ai_battle: 'basic',
    race: 'elo'
};
const ElodinoStats = {
    phys_power: 15,
    magic_power: 20,
    movement_speed: 2
};
const ElodinoResists = new damage_types_1.Damage(30, 50, 0, 20);
const elo_moraes = ['xi', 'lo', 'mi', 'ki', 'a', 'i', 'ku'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(elo_moraes, 3);
}
exports.EloTemplate = new templates_1.CharacterTemplate(0, ElodinoArchetype, generate_name, 200, ElodinoStats, ElodinoResists, 2);
