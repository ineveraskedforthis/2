"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const systems_communication_1 = require("../../systems_communication");
var Request;
(function (Request) {
    function accuracy(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
    }
    Request.accuracy = accuracy;
})(Request = exports.Request || (exports.Request = {}));
