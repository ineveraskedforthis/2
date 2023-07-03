import { CharacterTemplate } from "../types";
import { gen_from_moraes } from "./generate_name_moraes";

export const GraciTemplate: CharacterTemplate = {
    model: 'graci',
    ai_map: 'nomad',
    ai_battle: 'basic',
    race: 'graci',
    stats: 'Graci',
    resists: 'Graci',
    name_generator: generate_name,
    max_hp: 'Graci'
}

const graci_moraes = ['O', 'u', 'La', 'Ma', 'a', 'A', 'Ou']
function generate_name() {
    return gen_from_moraes(graci_moraes, 2)
}
