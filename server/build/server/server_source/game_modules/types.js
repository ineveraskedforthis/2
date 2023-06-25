"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.weapon_attack_tags = exports.armour_slots = void 0;
exports.armour_slots = ['body', 'legs', 'arms', 'head', 'foot'];
exports.weapon_attack_tags = ['polearms', 'noweapon', 'onehand', 'ranged', 'twohanded'];
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
