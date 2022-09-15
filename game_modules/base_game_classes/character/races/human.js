"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanTemplateColony = exports.HumanTemplateNotAligned = void 0;
const damage_types_1 = require("../../misc/damage_types");
const templates_1 = require("../templates");
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
const HumanBaseResists = new damage_types_1.DamageByTypeObject(0, 0, 0, 0);
exports.HumanTemplateNotAligned = new templates_1.CharacterTemplate(0, HumanArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists, -1);
exports.HumanTemplateColony = new templates_1.CharacterTemplate(0, HumanArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists, 3);
