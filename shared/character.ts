export type reputation_level = 'enemy'|'neutral'|'friend'|'member'|'leader'
export type Perks = 
    'meat_master' 
    | 'advanced_unarmed' 
    | 'advanced_polearm' 
    | 'mage_initiation' 
    | 'magic_bolt' 
    | 'fletcher' 
    | 'skin_armour_master' 
    | 'blood_mage'
    | 'dodge'
    | 'charge'
    | 'alchemist'
    | 'shoemaker'
    | 'weapon_maker'


export type PhysicalTraits = 
    'claws'

export type MentalTraits =
    'minor_depression'
    |'depression'
    |'major_depression'
    |'anger_issues'
    |'bipolar_disorder_high'
    |'bipolar_disorder_low'
    |'adhd_hyperfocus'
    |'adhd_unfocused'

export type Traits = PhysicalTraits | MentalTraits

export type PerksTable = {[_ in Perks]?: boolean}
export type TraitsTable = {[_ in Traits]?: boolean}