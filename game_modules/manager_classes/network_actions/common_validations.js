"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorSM = void 0;
var ValidatorSM;
(function (ValidatorSM) {
    function valid_user(user) {
        if (!user.logged_in)
            return false;
        if (user.char_id == -1)
            return false;
        if (user.id == -1)
            return false;
        return true;
    }
    ValidatorSM.valid_user = valid_user;
})(ValidatorSM = exports.ValidatorSM || (exports.ValidatorSM = {}));
