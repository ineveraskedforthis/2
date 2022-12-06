"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterTemplate = void 0;
class CharacterTemplate {
    constructor(money, archetype, name_gen, max_hp, stats, base_resists, faction) {
        this.starting_money = money;
        this.archetype = archetype;
        this.name_generator = name_gen;
        this.max_hp = max_hp;
        this.stats = stats;
        this.base_resists = base_resists;
        this.faction = faction;
    }
}
exports.CharacterTemplate = CharacterTemplate;
