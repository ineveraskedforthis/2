"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
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
        if (user.data.char_id == -1)
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
})(Validator = exports.Validator || (exports.Validator = {}));
