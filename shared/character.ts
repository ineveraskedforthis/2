export type reputation_level = 'enemy'|'neutral'|'friend'|'member'|'leader'

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
export type TraitsTable = {[_ in Traits]?: boolean}