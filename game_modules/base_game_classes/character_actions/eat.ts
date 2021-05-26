import type { CharacterGenericPart } from "../character_generic_part";

export function eat(char:CharacterGenericPart) {
    if (!char.in_battle()) {
        let tmp = char.stash.get('food');
        if (tmp > 0) {
            char.change_hp(10);
            char.stash.inc('food', -1);
        }
    }
}