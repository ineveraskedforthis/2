import { UnitData } from "./base_game_classes/battle/unit";
import { Character } from "./base_game_classes/character/character";
import { CharacterSystem } from "./base_game_classes/character/system";
import { UI_Part } from "./client_communication/causality_graph";
import { User, UserData } from "./client_communication/user";
import { UserManagement } from "./client_communication/user_manager";
import { Cell } from "./map/cell";
import { MapSystem } from "./map/system";
import { user_online_id } from "./types";


export namespace Convert {
    export function  unit_to_character(unit: UnitData): Character {
        return CharacterSystem.id_to_character(unit.char_id)
    }

    export function user_to_character(user: User):Character|undefined {
        if (user.data.char_id == '@') return undefined;
        return CharacterSystem.id_to_character(user.data.char_id)
    }

    export function character_to_user_data(character:Character):UserData|undefined {
        if (character.user_id == '#') return undefined
        return UserManagement.get_user_data(character.user_id)
    }

    export function character_to_user(character:Character):User|undefined {
        let data = character_to_user_data(character)
        if (data == undefined) return undefined
        return UserManagement.get_user(data.id as user_online_id)
    }

    export function character_to_cell(character: Character):Cell {
        let cell = MapSystem.SAFE_id_to_cell(character.cell_id)
        return cell
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
            UserManagement.add_user_to_update_queue(user_online.data.id, 'character_creation')
        }
    }

    export function character_and_cell(character: Character, cell: Cell) {
        console.log('linking character with cell ' + cell.x + ' ' + cell.y)
        // add to the list and notify locals
        // note: rewrite later to lazy sending: send local characters to local characters once in X seconds if there are changes
        //       and send list immediately only to entering user
        cell.enter(character.id)
        character.cell_id = cell.id
        const locals = cell.get_characters_list()
        for (let item of locals) {
            const id = item.id
            const local_character = CharacterSystem.id_to_character(id)
            const local_user = Convert.character_to_user(local_character)
            if (local_user == undefined) {continue}
            UserManagement.add_user_to_update_queue(local_user.data.id, UI_Part.LOCAL_CHARACTERS)
        }

        // check if it is a user and needs updates, otherwise return immediately
        const user = Convert.character_to_user(character)
        if (user == undefined) {
            return
        }

        // exploration
        character.explored[cell.id] = true
        let neighbours = MapSystem.neighbours_cells(cell.id)
        for (let item of neighbours) {
            character.explored[item.id] = true
        }
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.EXPLORED)
    }
}

export namespace Unlink {
    export function user_data_and_character(user: UserData| undefined, character: Character|undefined) {
        if (user == undefined) return
        if (character == undefined) return
        console.log('unlinking user and character')
        user.char_id = '@'
        character.user_id = '#'
        UserManagement.add_user_to_update_queue(user.id, 'character_removal')
    }

    export function character_and_cell(character: Character, cell: Cell) {
        cell.exit(character.id)
        const locals = cell.get_characters_list()
        for (let item of locals) {
            const id = item.id
            const local_character = CharacterSystem.id_to_character(id)
            const local_user = Convert.character_to_user(local_character)
            if (local_user == undefined) {continue}
            UserManagement.add_user_to_update_queue(local_user.data.id, UI_Part.LOCAL_CHARACTERS)
        }
    }
}

    // enter(char: Character) {
    //     this.characters_set.add(char.id)
    //     this.world.socket_manager.send_market_info_character(this, char)
        
    //     this.world.socket_manager.send_cell_updates(this)
    // }

    // exit(char: Character) {
    //     this.characters_set.delete(char.id)
    //     this.world.socket_manager.send_cell_updates(this)
    // }
