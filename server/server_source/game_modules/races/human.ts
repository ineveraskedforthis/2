import { Damage } from "../misc/damage_types";
import { Archetype, Stats } from "../character/character_parts";
import { CharacterTemplate } from "../character/templates";

const HumanArchetype:Archetype = {
    model: 'human',
    ai_map: 'dummy',
    ai_battle: 'basic',
    race: 'human'
}

function HumanNamesGen () {
    return 'name ' + Math.floor(Math.random() * 50)
}

const HumanStats:Stats = {
    phys_power: 10,
    magic_power: 10,
    movement_speed: 1
}

const HumanBaseResists = new Damage(0, 0, 0, 0)

export const Human = new CharacterTemplate(HumanArchetype, HumanNamesGen, 100, HumanStats, HumanBaseResists)