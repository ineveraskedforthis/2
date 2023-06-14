import { Damage } from "../Damage";
import { CharacterTemplate } from "../character/templates";
import { Archetype, Stats } from "../types";

const HumanArchetype:Archetype = {
    model: 'human',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human'
}

const HumanStrongArchetype:Archetype = {
    model: 'human_strong',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human'
}

const RatHunterArchetype:Archetype = {
    model: 'human',
    ai_map: 'rat_hunter',
    ai_battle: 'basic',
    race: 'human',
}

const TraderArchetype: Archetype = {
    model: 'human',
    ai_map: 'urban_trader',
    ai_battle: 'basic',
    race: 'human',
}

function HumanNamesGen () {
    return 'name ' + Math.floor(Math.random() * 50)
}

const HumanStats:Stats = {
    phys_power: 10,
    magic_power: 10,
    movement_speed: 1
}

const HumanStrongStats:Stats = {
    phys_power: 40,
    magic_power: 2,
    movement_speed: 2
}

const HumanBaseResists = new Damage(0, 0, 0, 0)

export const HumanTemplate = new CharacterTemplate(HumanArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists)
export const HumanStrongTemplate = new CharacterTemplate(HumanStrongArchetype, HumanNamesGen, 200, HumanStrongStats, HumanBaseResists)
export const Trader = new CharacterTemplate(TraderArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists)
export const RatHunterHuman = new CharacterTemplate(RatHunterArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists)