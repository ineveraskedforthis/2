export type Perks = 'meat_master' | 'advanced_unarmed' | 'advanced_polearm' | 'mage_initiation' | 'magic_bolt' | 'fletcher' | 'skin_armour_master' | 'blood_mage';
export const perks_list: Perks[] = ['meat_master', 'advanced_unarmed', 'advanced_polearm', 'mage_initiation', 'magic_bolt', 'fletcher', 'skin_armour_master', 'blood_mage'];
export interface PerksTable {
    meat_master?: boolean;
    claws?: boolean;
    advanced_unarmed?: boolean;
    advanced_polearm?: boolean;
    mage_initiation?: boolean;
    magic_bolt?: boolean;
    blood_mage?: boolean;
    fletcher?: boolean;
    skin_armour_master?: boolean;
    weapon_maker?: boolean;
    alchemist?: boolean;
    shoemaker?: boolean;
    dodge?: boolean;
    charge?: boolean;
}