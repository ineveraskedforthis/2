import { MaterialData } from "@content/content"
import { UI_Part } from "../client_communication/causality_graph"
import { UserManagement } from "../client_communication/user_manager"
import { Character } from "../data/entities/character"
import { CHANGE_REASON, Effect } from "../effects/effects"

export namespace CharacterEffect {
    export function eat(character: Character, material: MaterialData) {
        character.stash.inc(material.id, -1)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
        Effect.Change.hp(character, Math.round(material.unit_size * material.density * 20 + material.magic_power * 5 + 1), CHANGE_REASON.EATING)
        Effect.Change.stress(character, -Math.round(material.unit_size * material.density * 5 + material.magic_power * 10 + 1), CHANGE_REASON.EATING)
        Effect.Change.fatigue(character, -Math.round(material.unit_size * material.density * 20 + material.magic_power * 5 + 1), CHANGE_REASON.EATING)
    }

    export function eat_5(character: Character, material: MaterialData) {
        let eaten = 5
        if (character.stash.get(material.id) < 5)
            eaten = character.stash.get(material.id);

        character.stash.inc(material.id, -eaten)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
        Effect.Change.hp(character, Math.round(eaten * (material.unit_size * material.density * 20 + material.magic_power * 5 + 1)), CHANGE_REASON.EATING)
        Effect.Change.stress(character, -Math.round(eaten * (material.unit_size * material.density * 5 + material.magic_power * 10 + 1)), CHANGE_REASON.EATING)
        Effect.Change.fatigue(character, -Math.round(eaten * (material.unit_size * material.density * 20 + material.magic_power * 5 + 1)), CHANGE_REASON.EATING)
    }

    export function open_shop(character: Character) {
        character.open_shop = true;
        character.equip.data.backpack.limit = 100
    }

    export function close_shop(character: Character) {
        character.open_shop = false,
        character.equip.data.backpack.limit = 10
    }
}