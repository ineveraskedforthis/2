import { CharacterTemplate } from "../types";
import { gen_from_moraes } from "./generate_name_moraes";

export const RatTemplate: CharacterTemplate = {
    model: 'rat',
    ai_map: 'rat',
    ai_battle: 'basic',
    race: 'rat',
    stats: "Rat",
    resists: "Rat",
    name_generator: generate_name,
    max_hp: 'Rat'
}

export const BigRatTemplate: CharacterTemplate = {
    model: 'bigrat',
    ai_map: 'rat',
    ai_battle: 'basic',
    race: 'rat',
    stats: "BigRat",
    resists: "BigRat",
    name_generator: generate_name,
    max_hp: 'BigRat'
}

export const BerserkRatTemplate: CharacterTemplate = {
    model: 'berserkrat',
    ai_map: 'rat',
    ai_battle: 'basic',
    race: 'rat',
    stats: "BerserkRat",
    resists: "BerserkRat",
    name_generator: generate_name,
    max_hp: 'BerserkRat'
}

export const MageRatTemplate: CharacterTemplate = {
    model: 'magerat',
    ai_map: 'rat',
    ai_battle: 'basic',
    race: 'rat',
    stats: "MageRat",
    resists: "Rat",
    name_generator: generate_name,
    max_hp: 'MageRat'
}

const rat_moraes = ['s', 'shi', "S'", "fu", 'fi']
function generate_name() {
    return gen_from_moraes(rat_moraes, 5)
}