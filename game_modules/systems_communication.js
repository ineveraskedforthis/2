"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unlink = exports.Link = exports.Convert = void 0;
const system_1 = require("./base_game_classes/battle/system");
const system_2 = require("./base_game_classes/character/system");
const user_manager_1 = require("./client_communication/user_manager");
const system_3 = require("./map/system");
var Convert;
(function (Convert) {
    function unit_to_character(unit) {
        return system_2.CharacterSystem.id_to_character(unit.char_id);
    }
    Convert.unit_to_character = unit_to_character;
    function user_to_character(user) {
        if (user.data.char_id == '@')
            return undefined;
        return system_2.CharacterSystem.id_to_character(user.data.char_id);
    }
    Convert.user_to_character = user_to_character;
    function character_to_battle(character) {
        if (character.battle_id == -1)
            return undefined;
        return system_1.BattleSystem.id_to_battle(character.battle_id);
    }
    Convert.character_to_battle = character_to_battle;
    function character_to_unit(character) {
        const battle = character_to_battle(character);
        if (battle == undefined)
            return;
        return battle.heap.get_unit(character.battle_unit_id);
    }
    Convert.character_to_unit = character_to_unit;
    function character_to_user_data(character) {
        if (character.user_id == '#')
            return undefined;
        return user_manager_1.UserManagement.get_user_data(character.user_id);
    }
    Convert.character_to_user_data = character_to_user_data;
    function unit_to_unit_socket(unit) {
        const character = unit_to_character(unit);
        return {
            tag: character.model(),
            position: unit.position,
            range: character.range(),
            name: character.name,
            hp: character.get_hp(),
            ap: unit.action_points_left,
            id: unit.id,
            next_turn: unit.next_turn_after
        };
    }
    Convert.unit_to_unit_socket = unit_to_unit_socket;
    function socket_wrapper_to_user_character(socket) {
        if (socket.user_id == '#') {
            return [undefined, undefined];
        }
        const user = user_manager_1.UserManagement.get_user(socket.user_id);
        const character = Convert.user_to_character(user);
        if (character == undefined) {
            return [undefined, undefined];
        }
        return [user, character];
    }
    Convert.socket_wrapper_to_user_character = socket_wrapper_to_user_character;
    function character_to_user(character) {
        let data = character_to_user_data(character);
        if (data == undefined)
            return undefined;
        return user_manager_1.UserManagement.get_user(data.id);
    }
    Convert.character_to_user = character_to_user;
    function character_to_cell(character) {
        let cell = system_3.MapSystem.SAFE_id_to_cell(character.cell_id);
        return cell;
    }
    Convert.character_to_cell = character_to_cell;
})(Convert = exports.Convert || (exports.Convert = {}));
var Link;
(function (Link) {
    function character_and_user_data(character, user) {
        console.log('linking user and character');
        character.user_id = user.id;
        user.char_id = character.id;
        if (user_manager_1.UserManagement.user_is_online(user.id)) {
            console.log('user is online');
            let user_online = user_manager_1.UserManagement.get_user(user.id);
            user_manager_1.UserManagement.add_user_to_update_queue(user_online.data.id, 'character_creation');
        }
        user_manager_1.UserManagement.save_users();
        system_2.CharacterSystem.save();
    }
    Link.character_and_user_data = character_and_user_data;
    function character_and_cell(character, cell) {
        console.log('linking character with cell ' + cell.x + ' ' + cell.y);
        // add to the list and notify locals
        // note: rewrite later to lazy sending: send local characters to local characters once in X seconds if there are changes
        //       and send list immediately only to entering user
        cell.enter(character.id);
        character.cell_id = cell.id;
        const locals = cell.get_characters_list();
        console.log('local characters in cell now:');
        console.log(locals);
        for (let item of locals) {
            const id = item.id;
            const local_character = system_2.CharacterSystem.id_to_character(id);
            user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 8 /* UI_Part.LOCAL_CHARACTERS */);
        }
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 8 /* UI_Part.LOCAL_CHARACTERS */);
        // exploration
        character.explored[cell.id] = true;
        let neighbours = system_3.MapSystem.neighbours_cells(cell.id);
        for (let item of neighbours) {
            character.explored[item.id] = true;
        }
        //updates
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 9 /* UI_Part.EXPLORED */);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 10 /* UI_Part.LOCAL_ACTIONS */);
    }
    Link.character_and_cell = character_and_cell;
})(Link = exports.Link || (exports.Link = {}));
var Unlink;
(function (Unlink) {
    function user_data_and_character(user, character) {
        if (user == undefined)
            return;
        if (character == undefined)
            return;
        console.log('unlinking user and character');
        user.char_id = '@';
        character.user_id = '#';
        user_manager_1.UserManagement.add_user_to_update_queue(user.id, 'character_removal');
    }
    Unlink.user_data_and_character = user_data_and_character;
    function character_and_cell(character, cell) {
        cell.exit(character.id);
        const locals = cell.get_characters_list();
        for (let item of locals) {
            const id = item.id;
            const local_character = system_2.CharacterSystem.id_to_character(id);
            const local_user = Convert.character_to_user(local_character);
            if (local_user == undefined) {
                continue;
            }
            user_manager_1.UserManagement.add_user_to_update_queue(local_user.data.id, 8 /* UI_Part.LOCAL_CHARACTERS */);
        }
    }
    Unlink.character_and_cell = character_and_cell;
})(Unlink = exports.Unlink || (exports.Unlink = {}));
// enter(char: Character) {
//     this.characters_set.add(char.id)
//     this.world.socket_manager.send_market_info_character(this, char)
//     this.world.socket_manager.send_cell_updates(this)
// }
// exit(char: Character) {
//     this.characters_set.delete(char.id)
//     this.world.socket_manager.send_cell_updates(this)
// }
