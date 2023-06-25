"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraderTemplate = exports.RatHunterTemplate = exports.HumanStrongTemplate = exports.HumanTemplate = void 0;
exports.HumanTemplate = {
    model: 'human',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human',
    stats: 'Human',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'Human',
};
exports.HumanStrongTemplate = {
    model: 'human_strong',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human',
    stats: 'HumanStrong',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'HumanStrong',
};
exports.RatHunterTemplate = {
    model: 'human',
    ai_map: 'rat_hunter',
    ai_battle: 'basic',
    race: 'human',
    stats: 'Human',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'Human',
};
exports.TraderTemplate = {
    model: 'human',
    ai_map: 'urban_trader',
    ai_battle: 'basic',
    race: 'human',
    stats: 'Human',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'Human',
};
function HumanNamesGen() {
    return 'name ' + Math.floor(Math.random() * 50);
}
