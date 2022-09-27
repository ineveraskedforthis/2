"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnateStats = exports.Status = void 0;
const damage_types_1 = require("../misc/damage_types");
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
class InnateStats {
    constructor(speed, phys, magic, max_hp) {
        this.max = new Status();
        this.max.hp = max_hp;
        this.stats = {
            movement_speed: speed,
            phys_power: phys,
            magic_power: magic,
        };
        this.base_resists = new damage_types_1.Damage();
    }
}
exports.InnateStats = InnateStats;
