import { PgPool } from "../../world";
import { CharacterGenericPart } from "../character_generic_part";

export async function elo(pool: PgPool, char: CharacterGenericPart) {
    char.misc.tag = 'elo'
    char.misc.ai_tag = 'forest_walker'
    char.misc.model = 'elodino'
    char.stats.phys_power = 10
    char.stats.magic_power = 20

    char.status.hp = 200
    char.stats.max.hp = 200

    char.skills.perks.claws = true
    await char.save_to_db(pool)
}