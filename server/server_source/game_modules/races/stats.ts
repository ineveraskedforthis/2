export const BaseStats = {
    Elodino: {
        phys_power: 15,
        magic_power: 20,
        movement_speed: 2,
        learning: 10
    },

    Graci: {
        phys_power: 50,
        magic_power: 5,
        movement_speed: 3,
        learning: 15
    },

    Human: {
        phys_power: 10,
        magic_power: 10,
        movement_speed: 1,
        learning: 10
    },

    HumanStrong: {
        phys_power: 30,
        magic_power: 2,
        movement_speed: 2,
        learning: 10
    },

    Ball: {
        phys_power: 5,
        magic_power: 5,
        movement_speed: 0.5,
        learning: 0,
    },
    Rat: {
        phys_power: 10,
        magic_power: 10,
        movement_speed: 2,
        learning: 10
    },

    MageRat: {
        phys_power: 4,
        magic_power: 20,
        movement_speed: 1.5,
        learning: 30
    },

    BigRat: {
        phys_power: 25,
        magic_power: 10,
        movement_speed: 1,
        learning: 15
    },

    BerserkRat : {
        phys_power: 30,
        magic_power: 5,
        movement_speed: 1,
        learning: 15
    }
}

export type StatsTag = keyof typeof BaseStats