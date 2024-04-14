"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skeleton = exports.model_interface_name = exports.Status = void 0;
class Status {
    constructor() {
        this.hp = 100;
        this.rage = 100;
        this.blood = 100;
        this.stress = 100;
        this.fatigue = 100;
    }
}
exports.Status = Status;
function model_interface_name(model) {
    switch (model) {
        case "human": return 'human';
        case "rat": return 'rat';
        case "graci": return 'graci';
        case "elo": return 'elodino';
        case "test": return 'test character';
        case "bigrat": return 'giant rat';
        case "magerat": return 'mage rat';
        case "berserkrat": return 'berserk rat';
        case "human_strong": return 'mutated human';
        case "ball": return 'meat ball';
    }
}
exports.model_interface_name = model_interface_name;
function skeleton(model) {
    switch (model) {
        case "human": return true;
        case "rat": return true;
        case "graci": return true;
        case "elo": return false;
        case "test": return false;
        case "bigrat": return true;
        case "magerat": return true;
        case "berserkrat": return true;
        case "human_strong": return true;
        case "ball": return false;
    }
}
exports.skeleton = skeleton;

