import { PgPool } from "../../world";
import { CharacterGenericPart } from "../character_generic_part";

export async function graci(pool: PgPool, char: CharacterGenericPart) {
    char.misc.tag = 'graci'
    char.misc.ai_tag = 'steppe_walker_passive'
    char.misc.model = 'graci'
    char.stats.phys_power = 100
    char.stats.magic_power = 5

    char.status.hp = 1000
    char.stats.max.hp = 1000

    char.skills.perks.claws = true
    await char.save_to_db(pool)
}