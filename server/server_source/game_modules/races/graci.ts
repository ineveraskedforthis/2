import { Damage } from "../damage_types";
import { Archetype, Stats } from "../types";
import { CharacterTemplate } from "../character/templates";
import { gen_from_moraes } from "./generate_name_moraes";

const GraciArchetype: Archetype = {
    model: 'graci',
    ai_map: 'steppe_walker_passive',
    ai_battle: 'basic',
    race: 'graci'
}

const GraciStats: Stats = {
    phys_power: 50,
    magic_power: 5,
    movement_speed: 3
}

const GraciResists = new Damage(0, 0, 0, 0)

const graci_moraes = ['O', 'u', 'La', 'Ma', 'a', 'A', 'Ou']
function generate_name() {
    return gen_from_moraes(graci_moraes, 2)
}

export const GraciTemplate = new CharacterTemplate(GraciArchetype, generate_name, 1000, GraciStats, GraciResists)