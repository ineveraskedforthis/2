"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BallTemplate = void 0;
const Damage_1 = require("../Damage");
const templates_1 = require("../character/templates");
const generate_name_moraes_1 = require("./generate_name_moraes");
const BallArchetype = {
    model: 'ball',
    ai_map: 'forest_walker',
    ai_battle: 'basic',
    race: 'ball'
};
const BallStats = {
    phys_power: 5,
    magic_power: 5,
    movement_speed: 0.5
};
const BallResists = new Damage_1.Damage(0, 0, 0, 0);
const moraes = ['gu', 'bu', 'mu', 'zu', 'du'];
function generate_name() {
    return (0, generate_name_moraes_1.gen_from_moraes)(moraes, 5);
}
exports.BallTemplate = new templates_1.CharacterTemplate(BallArchetype, generate_name, 300, BallStats, BallResists);
