"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Human = void 0;
const Damage_1 = require("../Damage");
const templates_1 = require("../character/templates");
const HumanArchetype = {
    model: 'human',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human'
};
function HumanNamesGen() {
    return 'name ' + Math.floor(Math.random() * 50);
}
const HumanStats = {
    phys_power: 10,
    magic_power: 10,
    movement_speed: 1
};
const HumanBaseResists = new Damage_1.Damage(0, 0, 0, 0);
exports.Human = new templates_1.CharacterTemplate(HumanArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists);
