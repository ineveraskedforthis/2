import { ITEM_MATERIAL } from "./item_tags";

// export type tag = 'food'|'clothes'|'meat'|'water'|'leather'|'tools'|'zaz';
// export type weapon_type = 'onehand'|'polearms'|'noweapon'|'twohanded'

export const enum WEAPON_TYPE {
    ONEHAND = 'onehand',
    POLEARMS = 'polearms',
    NOWEAPON = 'noweapon',
    TWOHANDED = 'twohanded',
    RANGED = 'ranged'
}

export type damage_type = 'blunt'|'pierce'|'slice'|'fire'

export type StashData = {
    [index in number]: number
}

export interface Status {
    hp: number;
    rage: number;
    blood: number;
    stress: number;
}

export interface InnateStats {

}

export interface Misc {

}

interface CharacterFlags {

}
