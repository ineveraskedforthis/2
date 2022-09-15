import { DamageByTypeObject } from "../misc/damage_types";
import { Archetype, Stats, Status } from "./character_parts";

export class CharacterTemplate {
    starting_money: number;
    archetype: Archetype;

    // resistances: DamageByTypeObject;
    name_generator: () => string;
    
    max_hp: number;
    stats: Stats
    base_resists: DamageByTypeObject;

    faction: number
    
    constructor(money: number, archetype: Archetype, name_gen: () => string, max_hp: number, stats: Stats, base_resists:DamageByTypeObject, faction: number) {
        this.starting_money = money;
        this.archetype = archetype
        this.name_generator = name_gen
        this.max_hp = max_hp
        this.stats = stats
        this.base_resists = base_resists
        this.faction = faction
    }
}