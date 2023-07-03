import { CharacterTemplate } from "../types";
import { gen_from_moraes } from "./generate_name_moraes";

const elo_moraes = ['xi', 'lo', 'mi', 'ki', 'a', 'i', 'ku']
function generate_name() {
    return gen_from_moraes(elo_moraes, 3)
}

export const ElodinoTemplate: CharacterTemplate = {
    model: 'elo',
    ai_map: 'forest_dweller',
    ai_battle: 'basic',
    race: 'elo',
    stats: "Elodino",
    resists: "Elodino",
    name_generator: generate_name,
    max_hp: "Elodino",
}