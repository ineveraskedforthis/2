import { Damage } from "../Damage";
import { Archetype, Stats } from "../types";
import { CharacterTemplate } from "../character/templates";
import { gen_from_moraes } from "./generate_name_moraes";

const BallArchetype: Archetype = {
    model: 'ball',
    ai_map: 'forest_walker',
    ai_battle: 'basic',
    race: 'ball'
}

const BallStats: Stats = {
    phys_power: 5,
    magic_power: 5,
    movement_speed: 0.5
}

const BallResists = new Damage(0, 0, 0, 0)

const moraes = ['gu', 'bu', 'mu', 'zu', 'du']
function generate_name() {
    return gen_from_moraes(moraes, 5)
}

export const BallTemplate = new CharacterTemplate(BallArchetype, generate_name, 300, BallStats, BallResists)