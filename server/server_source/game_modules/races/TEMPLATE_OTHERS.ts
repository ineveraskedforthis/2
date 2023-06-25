import { CharacterTemplate } from "../types";
import { gen_from_moraes } from "./generate_name_moraes";

export const BallTemplate: CharacterTemplate = {
    model: 'ball',
    ai_map: 'forest_walker',
    ai_battle: 'basic',
    race: 'ball',
    stats: "Ball",
    resists: "Ball",
    name_generator: generate_name,
    max_hp: "Ball",
}

const moraes = ['gu', 'bu', 'mu', 'zu', 'du']
function generate_name() {
    return gen_from_moraes(moraes, 5)
}
