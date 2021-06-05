import { CharacterGenericPart } from "../character_generic_part";

export function human(char: CharacterGenericPart) {
    char.misc.tag = 'human'
    char.misc.model = 'test'
}

