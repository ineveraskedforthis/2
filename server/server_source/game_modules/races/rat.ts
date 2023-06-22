import { Damage } from "../Damage";
import { CharacterTemplate } from "../character/templates";
import { gen_from_moraes } from "./generate_name_moraes";
import { Archetype, Stats } from "../types";

const RatArchetype: Archetype = {
    model: 'rat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
}

const BigRatArchetype: Archetype = {
    model: 'bigrat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
}

const BerserkRatArchetype: Archetype = {
    model: 'berserkrat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
}

const MageRatArchetype: Archetype = {
    model: 'magerat',
    ai_map: 'steppe_walker_agressive',
    ai_battle: 'basic',
    race: 'rat'
}

const RatStats: Stats = {
    phys_power: 10,
    magic_power: 10,
    movement_speed: 2
}

const MageRatStats: Stats = {
    phys_power: 4,
    magic_power: 20,
    movement_speed: 1.5
}

const BigRatStats: Stats = {
    phys_power: 25,
    magic_power: 10,
    movement_speed: 1
}

const RatResists = new Damage(5, 5, 5, 20)
const BerserkResists = new Damage(0, 0, 0, 0)

const rat_moraes = ['s', 'shi', "S'", "fu", 'fi']
function generate_name() {
    return gen_from_moraes(rat_moraes, 5)
}

export const RatTemplate = new CharacterTemplate(RatArchetype, generate_name, 50, RatStats, RatResists)
export const BigRatTemplate = new CharacterTemplate(BigRatArchetype, generate_name, 150, BigRatStats, RatResists)
export const MageRatTemplate = new CharacterTemplate(MageRatArchetype, generate_name, 20, MageRatStats, RatResists)
export const BerserkRatTemplate = new CharacterTemplate(BerserkRatArchetype, generate_name, 100, BigRatStats, BerserkResists)