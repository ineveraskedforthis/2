import { Damage } from "../damage_types";
import { Archetype, Stats } from "../types";

export class CharacterTemplate {
    archetype: Archetype;

    // resistances: DamageByTypeObject;
    name_generator: () => string;
    
    max_hp: number;
    stats: Stats
    base_resists: Damage;
    
    constructor(archetype: Archetype, name_gen: () => string, max_hp: number, stats: Stats, base_resists:Damage) {
        this.archetype = archetype
        this.name_generator = name_gen
        this.max_hp = max_hp
        this.stats = stats
        this.base_resists = base_resists
    }
}