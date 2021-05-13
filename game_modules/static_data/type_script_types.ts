export type tag = 'food'|'clothes'|'meat'|'water'|'leather'|'tools'|'zaz';
export type weapon_type = 'onehand'|'polearms'|'noweapon'
export type damage_type = 'blunt'|'pierce'|'slice'|'fire'

export type StashData = {
    [index in tag]: number
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
