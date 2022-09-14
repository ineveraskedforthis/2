import { CharacterGenericPart } from "../base_game_classes/character_generic_part";
import { User, UserData, user_id, user_online_id } from "../user";
import { EntityManager } from "./entity_manager";

export namespace Convert {
    export function user_to_character(entity_manager: EntityManager, user: User):CharacterGenericPart|undefined {
        if (user.data.char_id == '@') return undefined;
        return entity_manager.chars[user.data.char_id]
    }
    function character_to_user_data(user_data: {[_ in user_id]: UserData}, character:CharacterGenericPart):UserData|undefined {
        if (character.user_id == '#') return undefined
        return user_data[character.user_id]
    }
    export function character_to_user(user_data: {[_ in user_id]: UserData}, users: {[_ in user_online_id]: User}, character:CharacterGenericPart):User|undefined {
        let data = character_to_user_data(user_data, character)
        if (data == undefined) return undefined
        return users[data.id as user_online_id]
    }
}