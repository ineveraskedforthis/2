import { PgPool } from "../../world";
import { CharacterGenericPart } from "../character_generic_part";
import { gen_from_moraes } from "./generate_name_moraes";

let moraes = ['s', 'shi', "S'", "fu", 'fi']



export async function rat(pool: PgPool, char: CharacterGenericPart) {
    char.misc.tag = 'rat'
    char.misc.ai_tag = 'steppe_walker_agressive'
    char.misc.model = 'rat'
    char.stats.phys_power = 5
    char.stats.magic_power = 5

    char.name = gen_from_moraes(moraes, 5)

    char.status.hp = 50
    char.stats.max.hp = 50

    char.skills.perks.claws = true
    await char.save_to_db(pool)
}