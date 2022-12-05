import { Damage } from "../../misc/damage_types";
import { Archetype, Stats } from "../character_parts";
import { CharacterTemplate } from "../templates";
import { gen_from_moraes } from "./generate_name_moraes";

const RatArchetype: Archetype = {
    model: 'rat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
}

const RatStats: Stats = {
    phys_power: 15,
    magic_power: 20,
    movement_speed: 2
}

const RatResists = new Damage(5, 5, 5, 20)

const rat_moraes = ['s', 'shi', "S'", "fu", 'fi']
function generate_name() {
    return gen_from_moraes(rat_moraes, 5)
}

export const RatTemplate = new CharacterTemplate(0, RatArchetype, generate_name, 50, RatStats, RatResists, 1)