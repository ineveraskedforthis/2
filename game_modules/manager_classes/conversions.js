"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Convert = void 0;
var Convert;
(function (Convert) {
    function user_to_character(entity_manager, user) {
        if (user.data.char_id == '@')
            return undefined;
        return entity_manager.chars[user.data.char_id];
    }
    Convert.user_to_character = user_to_character;
    function character_to_user_data(user_data, character) {
        if (character.user_id == '#')
            return undefined;
        return user_data[character.user_id];
    }
    function character_to_user(user_data, users, character) {
        let data = character_to_user_data(user_data, character);
        if (data == undefined)
            return undefined;
        return users[data.id];
    }
    Convert.character_to_user = character_to_user;
})(Convert = exports.Convert || (exports.Convert = {}));
