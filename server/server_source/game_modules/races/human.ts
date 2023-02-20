import { Damage } from "../Damage";
import { CharacterTemplate } from "../character/templates";
import { Archetype, Stats } from "../types";

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