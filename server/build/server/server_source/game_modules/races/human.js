"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatHunterHuman = exports.Trader = exports.HumanStrongTemplate = exports.HumanTemplate = void 0;
const Damage_1 = require("../Damage");
const templates_1 = require("../character/templates");
const HumanArchetype = {
    model: 'human',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human'
};
const HumanStrongArchetype = {
    model: 'human_strong',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human'
};
const RatHunterArchetype = {
    model: 'human',
    ai_map: 'rat_hunter',
    ai_battle: 'basic',
    race: 'human',
};
const TraderArchetype = {
    model: 'human',
    ai_map: 'urban_trader',
    ai_battle: 'basic',
    race: 'human',
};
function HumanNamesGen() {
    return 'name ' + Math.floor(Math.random() * 50);
}
const HumanStats = {
    phys_power: 10,
    magic_power: 10,
    movement_speed: 1,
    learning: 10
};
const HumanStrongStats = {
    phys_power: 30,
    magic_power: 2,
    movement_speed: 2,
    learning: 10
};
const HumanBaseResists = new Damage_1.Damage(0, 0, 0, 0);
exports.HumanTemplate = new templates_1.CharacterTemplate(HumanArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists);
exports.HumanStrongTemplate = new templates_1.CharacterTemplate(HumanStrongArchetype, HumanNamesGen, 200, HumanStrongStats, HumanBaseResists);
exports.Trader = new templates_1.CharacterTemplate(TraderArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists);
exports.RatHunterHuman = new templates_1.CharacterTemplate(RatHunterArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists);
