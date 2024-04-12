"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const data_objects_1 = require("../../data/data_objects");
const a = 'a'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const A = 'A'.charCodeAt(0);
const Z = 'Z'.charCodeAt(0);
const zero = '0'.charCodeAt(0);
const ku = '9'.charCodeAt(0);
var Validator;
(function (Validator) {
    function valid_user(user) {
        if (!user.logged_in)
            return false;
        if (user.data.character_id == -1)
            return false;
        if (user.data.id == -1)
            return false;
        return true;
    }
    Validator.valid_user = valid_user;
    function isAlphaNum(str) {
        let length = str.length;
        for (let i = 0; i < length; i++) {
            let char_code = str.charCodeAt(i);
            if ((char_code >= a) && (char_code <= z))
                continue;
            if ((char_code >= A) && (char_code <= Z))
                continue;
            if ((char_code >= zero) && (char_code <= ku))
                continue;
            return false;
        }
        return true;
    }
    Validator.isAlphaNum = isAlphaNum;
    function validate_creds(data) {
        if (data.login.length == 0) {
            return 'empty-login';
        }
        if (data.login.length >= 30) {
            return 'too-long';
        }
        if (data.password.length == 0) {
            return 'empty-pass';
        }
        if (!isAlphaNum(data.login)) {
            return 'login-not-allowed-symbols';
        }
        return 'ok';
    }
    Validator.validate_creds = validate_creds;
    function can_act(user, character) {
        if (!user.logged_in)
            return false;
        if (!character.in_battle)
            return false;
        if (character.dead())
            return false;
        return true;
    }
    Validator.can_act = can_act;
    function valid_action_to_character(user, character, target) {
        if (user == undefined)
            return [undefined, undefined, undefined];
        if (character == undefined)
            return [undefined, undefined, undefined];
        if (!Validator.can_act(user, character)) {
            return [undefined, undefined, undefined];
        }
        // console.log('user is valid')
        const data = Number(target);
        if (isNaN(data))
            return [undefined, undefined, undefined];
        const target_character = data_objects_1.Data.Characters.from_number(data);
        if (target_character == undefined)
            return [undefined, undefined, undefined];
        console.log('target character is vaalid');
        return [user, character, target_character];
    }
    Validator.valid_action_to_character = valid_action_to_character;
    function is_point(value) {
        if (!(typeof value === 'object') || value === null)
            return false;
        if (!('x' in value) || !('y' in value))
            return false;
        if (typeof value['x'] !== 'number' || typeof value['y'] !== 'number')
            return false;
        return true;
    }
    Validator.is_point = is_point;
    function is_tag_value(value) {
        if (!(typeof value === 'object') || value === null)
            return false;
        if (!('tag' in value))
            return false;
        if (!('target' in value))
            return false;
        if (!(typeof value.tag === 'string') || !(typeof value.target === 'number'))
            return false;
        return true;
    }
    Validator.is_tag_value = is_tag_value;
    function is_tag_point(value) {
        if (!(typeof value === 'object') || value === null)
            return false;
        if (!('tag' in value))
            return false;
        if (!('target' in value))
            return false;
        if (!(typeof value.tag === 'string'))
            return false;
        if (!is_point(value.target))
            return false;
        return true;
    }
    Validator.is_tag_point = is_tag_point;
})(Validator = exports.Validator || (exports.Validator = {}));
