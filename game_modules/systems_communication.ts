import { endianness } from "os";
import { UnitSocket } from "../shared/battle_data";
import { Battle } from "./base_game_classes/battle/classes/battle";
import { Unit } from "./base_game_classes/battle/classes/unit";
import { BattleSystem } from "./base_game_classes/battle/system";
import { Character } from "./base_game_classes/character/character";
import { CharacterSystem } from "./base_game_classes/character/system";
import { UI_Part } from "./client_communication/causality_graph";
import { SocketWrapper, User, UserData } from "./client_communication/user";
import { UserManagement } from "./client_communication/user_manager";
import { Cell } from "./map/cell";
import { MapSystem } from "./map/system";
import { user_online_id } from "./types";


export namespace Convert {
    export function  unit_to_character(unit: Unit): Character {
        return CharacterSystem.id_to_character(unit.char_id)
    }

    export function user_to_character(user: User):Character|undefined {
        if (user.data.char_id == '@') return undefined;
        return CharacterSystem.id_to_character(user.data.char_id)
    }

    export function character_to_battle(character: Character): Battle|undefined {
        if (character.battle_id == -1) return undefined

        return BattleSystem.id_to_battle(character.battle_id)
    }

    export function character_to_unit(character: Character): Unit|undefined {
        const battle = character_to_battle(character)
        if (battle == undefined)    return
        return battle.heap.get_unit(character.battle_unit_id)
    }

    export function character_to_user_data(character:Character):UserData|undefined {
        if (character.user_id == '#') return undefined
        return UserManagement.get_user_data(character.user_id)
    }

    export function unit_to_unit_socket(unit: Unit): UnitSocket {
        const character = unit_to_character(unit)
        return {
            tag: character.model(),
            position: unit.position,
            range: character.range(),
            name: character.name,
            hp: character.get_hp(),
            ap: unit.action_points_left,
            id: unit.id,
            next_turn: unit.next_turn_after
        }
    }

    export function socket_wrapper_to_user_character(socket: SocketWrapper): [User, Character]|[undefined, undefined] {
        if (socket.user_id == '#') {return [undefined, undefined]}
        const user = UserManagement.get_user(socket.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) {return [undefined, undefined]}

        return [user, character]
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
        UserManagement.save_users()
        CharacterSystem.save()
    }

    export function character_and_cell(character: Character, cell: Cell) {
        console.log('linking character with cell ' + cell.x + ' ' + cell.y)
        // add to the list and notify locals
        // note: rewrite later to lazy sending: send local characters to local characters once in X seconds if there are changes
        //       and send list immediately only to entering user
        cell.enter(character.id)
        character.cell_id = cell.id
        const locals = cell.get_characters_list()
        console.log('local characters in cell now:')
        console.log(locals)
        for (let item of locals) {
            const id = item.id
            const local_character = CharacterSystem.id_to_character(id)
            UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.LOCAL_CHARACTERS)
        }

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.LOCAL_CHARACTERS)


        // exploration
        character.explored[cell.id] = true
        let neighbours = MapSystem.neighbours_cells(cell.id)
        for (let item of neighbours) {
            character.explored[item.id] = true
        }

        //updates
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.EXPLORED)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.LOCAL_ACTIONS)
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
