import { CharacterGenericPart } from "../character_generic_part";

export async function human(pool: any, char: CharacterGenericPart) {
    char.misc.tag = 'human'
    char.misc.model = 'test'
    await char.save_to_db(pool)
}

