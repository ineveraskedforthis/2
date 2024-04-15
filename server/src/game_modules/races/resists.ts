import { Damage } from "../Damage";

export const BaseResists = {
    Elodino : new Damage(30, 50, 0, 20),
    Graci : new Damage(0, 0, 0, 0),
    Human : new Damage(0, 0, 0, 0),
    Ball : new Damage(0, 0, 0, 0),
    Rat : new Damage(5, 5, 5, 20),
    BigRat: new Damage(10, 10, 10, 20),
    BerserkRat : new Damage(0, 0, 0, 0)
}

export type BaseResistTag = keyof typeof BaseResists