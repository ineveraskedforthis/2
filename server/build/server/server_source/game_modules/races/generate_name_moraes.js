"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gen_from_moraes = void 0;
function gen_from_moraes(moraes, len) {
    let res = '';
    for (let i = 0; i < len; i++) {
        res += moraes[Math.floor(moraes.length * Math.random())];
    }
    return res;
}
exports.gen_from_moraes = gen_from_moraes;

