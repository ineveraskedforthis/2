import { Damage } from "../../misc/damage_types";
import { Archetype, Stats } from "../character_parts";
import { CharacterTemplate } from "../templates";
import { gen_from_moraes } from "./generate_name_moraes";

const ElodinoArchetype: Archetype = {
    model: 'elo',
    ai_map: 'forest_walker',
    ai_battle: 'basic',
    race: 'elo'
}

const ElodinoStats: Stats = {
    phys_power: 15,
    magic_power: 20,
    movement_speed: 2
}

const ElodinoResists = new Damage(10, 0, 0, 20)

const elo_moraes = ['xi', 'lo', 'mi', 'ki', 'a', 'i', 'ku']
function generate_name() {
    return gen_from_moraes(elo_moraes, 3)
}

export const EloTemplate = new CharacterTemplate(0, ElodinoArchetype, generate_name, 200, ElodinoStats, ElodinoResists, 2)