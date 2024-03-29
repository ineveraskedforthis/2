export const item_model_tags = [
    'bow' 
    , 'spear' 
    , 'bone_spear' 
    , 'bone_dagger' 
    , 'sword' 
    , 'wooden_mace' 
    , 'rat_skin_pants'
    , 'rat_skin_armour'
    , 'bone_armour'
    , 'elodino_dress'
    , 'graci_hair'
    , 'rat_skull_helmet'
    , 'rat_skin_helmet'
    , 'rat_skin_boots'
    , 'rat_skin_glove_left'
    , 'rat_skin_glove_right'
    , 'cloth_glove_left'
    , 'cloth_glove_right'
    , 'cloth_mail'
    , 'cloth_socks'
    , 'cloth_helmet' ,
    'bone_pauldron_left',
    'bone_pauldron_right',
    'rat_skin_pauldron_left',
    'rat_robe',
    'cloth_belt',
    'cloth_shirt',
    'cloth_pants'
] as const

export type item_model_tag = typeof item_model_tags[number]
