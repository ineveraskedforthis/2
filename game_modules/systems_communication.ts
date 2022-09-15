import { Character } from "./base_game_classes/character/character";
import { CharacterSystem } from "./base_game_classes/character/system";
import { User, UserData, user_online_id } from "./client_communication/user";
import { UserManagement } from "./client_communication/user_manager";


export namespace Convert {
    export function user_to_character(user: User):Character|undefined {
        if (user.data.char_id == '@') return undefined;
        return CharacterSystem.id_to_character(user.data.char_id)
    }

    function character_to_user_data(character:Character):UserData|undefined {
        if (character.user_id == '#') return undefined
        return UserManagement.get_user_data(character.user_id)
    }

    export function character_to_user(character:Character):User|undefined {
        let data = character_to_user_data(character)
        if (data == undefined) return undefined
        return UserManagement.get_user(data.id as user_online_id)
    }
}

export namespace Link {
    export function character_and_user_data(character: Character, user: UserData) {
        console.log('linking user and character')
        character.user_id = user.id
        user.char_id = character.id
        if (UserManagement.user_is_online(user.id)) {
            console.log('user is online')
            let user_online = UserManagement.get_user(user.id as user_online_id)
            UserManagement.add_user_to_update_queue(user_online.data.id)
            user_online.updates.new_character()
        }
    }
}