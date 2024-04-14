"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostile = void 0;
function hostile(actor, target) {
    switch (actor) {
        case 'human': if (target == 'rat') {
            return true;
        }
        else {
            return false;
        }
        case 'rat': if (target == 'human') {
            return true;
        }
        else {
            return false;
        }
        case 'elo': return false;
        case 'graci': return false;
        case "ball": return false;
    }
}
exports.hostile = hostile;

