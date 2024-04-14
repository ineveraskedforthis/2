"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseResists = void 0;
const Damage_1 = require("../Damage");
exports.BaseResists = {
    Elodino: new Damage_1.Damage(30, 50, 0, 20),
    Graci: new Damage_1.Damage(0, 0, 0, 0),
    Human: new Damage_1.Damage(0, 0, 0, 0),
    Ball: new Damage_1.Damage(0, 0, 0, 0),
    Rat: new Damage_1.Damage(5, 5, 5, 20),
    BigRat: new Damage_1.Damage(10, 10, 10, 20),
    BerserkRat: new Damage_1.Damage(0, 0, 0, 0)
};

