import { CharacterTemplate } from "../types"

export const HumanTemplate:CharacterTemplate = {
    model: 'human',
    ai_map: 'crafter',
    ai_battle: 'basic',
    race: 'human',
    stats: 'Human',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'Human',
}

export const HumanStrongTemplate:CharacterTemplate = {
    model: 'human_strong',
    ai_map: 'crafter',
    ai_battle: 'basic',
    race: 'human',
    stats: 'HumanStrong',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'HumanStrong',
}

export const RatHunterTemplate:CharacterTemplate = {
    model: 'human',
    ai_map: 'rat_hunter',
    ai_battle: 'basic',
    race: 'human',
    stats: 'Human',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'Human',
}

export const TraderTemplate: CharacterTemplate = {
    model: 'human',
    ai_map: 'urban_trader',
    ai_battle: 'basic',
    race: 'human',
    stats: 'Human',
    resists: 'Human',
    name_generator: HumanNamesGen,
    max_hp: 'Human',
}

function HumanNamesGen () {
    return 'name ' + Math.floor(Math.random() * 50)
}