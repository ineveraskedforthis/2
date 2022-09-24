"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unlink = exports.Link = exports.Convert = void 0;
const character_1 = require("./base_game_classes/character/character");
const system_1 = require("./base_game_classes/character/system");
const updates_1 = require("./client_communication/network_actions/updates");
const user_manager_1 = require("./client_communication/user_manager");
var Convert;
(function (Convert) {
    function user_to_character(user) {
        if (user.data.char_id == '@')
            return undefined;
        return system_1.CharacterSystem.id_to_character(user.data.char_id);
    }
    Convert.user_to_character = user_to_character;
    function character_to_user_data(character) {
        if (character.user_id == '#')
            return undefined;
        return user_manager_1.UserManagement.get_user_data(character.user_id);
    }
    function character_to_user(character) {
        let data = character_to_user_data(character);
        if (data == undefined)
            return undefined;
        return user_manager_1.UserManagement.get_user(data.id);
    }
    Convert.character_to_user = character_to_user;
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
    }
    Link.character_and_user_data = character_and_user_data;
    function character_and_cell(character, cell) {
        cell.characters_set.add(character.id);
        updates_1.SendUpdate.cell(cell);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 'market');
    }
    Link.character_and_cell = character_and_cell;
})(Link = exports.Link || (exports.Link = {}));
var Unlink;
(function (Unlink) {
    function character_and_cell(character, cell) {
    }
    Unlink.character_and_cell = character_and_cell;
})(Unlink = exports.Unlink || (exports.Unlink = {}));
enter(char, character_1.Character);
{
    this.characters_set.add(char.id);
    this.world.socket_manager.send_market_info_character(this, char);
    this.world.socket_manager.send_cell_updates(this);
}
exit(char, character_1.Character);
{
    this.characters_set.delete(char.id);
    this.world.socket_manager.send_cell_updates(this);
}
