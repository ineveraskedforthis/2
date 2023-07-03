// import { Armour, IMPACT_TYPE, Weapon } from "../static_data/item_tags";
import { affix_tag } from "../../../../shared/inventory";
import { AttackObj } from "../attack/class";
import { Character } from "../character/character";
import { Item } from "../items/item";
import { ELODINO_FLESH, GRACI_HAIR, materials } from "../manager_classes/materials_manager";
import { Damage } from "../Damage";
import { BaseDamage, ModelToMaterial, base_damage } from "../items/base_values";

export function get_potential_affix_weapon(enchant_rating:number, item:Item):{tag: affix_tag, weight: number}[] {
    let potential_affix:{tag: affix_tag, weight: number}[] = []
    
    // checking for phys damage mods
    if ((base_damage(item.model_tag).pierce > 0) || (base_damage(item.model_tag).slice > 0)) {
        potential_affix.push({tag: 'sharp', weight: 20})
        potential_affix.push({tag: 'notched', weight: 2})
    }
    if ((base_damage(item.model_tag).slice > 0) || (base_damage(item.model_tag).blunt > 0)){
        potential_affix.push({tag: 'heavy', weight: 10})
    }

    // adding universal mods
    if (enchant_rating > 20) {
        potential_affix.push({tag: 'hot', weight: 1})
        potential_affix.push({tag: 'of_power', weight: 1})
        potential_affix.push({tag: 'precise', weight: 5})
    }

    // extra mods
    if (enchant_rating > 150) {
        potential_affix.push({tag: 'daemonic', weight: 1})
        potential_affix.push({tag: 'of_madness', weight: 1})
    }
    return potential_affix
}

export function get_potential_affix_armour(enchant_rating:number, item:Item):{tag: affix_tag, weight: number}[] {
    let potential_affix:{tag: affix_tag, weight: number}[] = []

    //universal    
    potential_affix.push({tag: 'thick', weight: 25})
    potential_affix.push({tag: 'layered', weight: 25})
    potential_affix.push({tag: 'hard', weight: 25})

    // special when you reach 
    if (enchant_rating > 30) {
        potential_affix.push({tag: 'of_heat', weight: 3})
        potential_affix.push({tag: 'of_power', weight: 3})
        potential_affix.push({tag: 'of_protection', weight: 3})
    }


    // for local creatures you have better chances for special affixes
    // if your enchanting rating is high
    if (enchant_rating > 60) {
        if (ModelToMaterial[item.model_tag].string_tag == materials.index_to_material(ELODINO_FLESH).string_tag) {
            potential_affix.push({tag: 'of_heat', weight: 5})
            potential_affix.push({tag: 'of_power', weight: 5})
            potential_affix.push({tag: 'of_protection', weight: 5})
            potential_affix.push({tag: 'of_painful_protection', weight: 1})
            potential_affix.push({tag: 'of_elodino_pleasure', weight: 10})
            potential_affix.push({tag: 'of_elder_beast', weight: 1})
        }
    }
    
    if (enchant_rating > 100) {
        if (ModelToMaterial[item.model_tag].string_tag == materials.index_to_material(GRACI_HAIR).string_tag) {
            potential_affix.push({tag: 'of_heat', weight: 5})
            potential_affix.push({tag: 'of_power', weight: 5})
            potential_affix.push({tag: 'of_protection', weight: 5})
            potential_affix.push({tag: 'of_painful_protection', weight: 1})
            potential_affix.push({tag: 'of_graci_beauty', weight: 10})
            potential_affix.push({tag: 'of_elder_beast', weight: 1})
        }
    }



    return potential_affix
}


export function enchant_item(enchant_rating: number, item: Item, potential_affix:{tag: affix_tag, weight: number}[]) {
    // enchant success
    let current_affixes = item.affixes.length
    let difficulty = 10 * current_affixes * current_affixes
    let luck = Math.random()
    if (((luck + 1) * enchant_rating) < difficulty) {
        return 'fail'
    }

    //selection of the affix
    let total_weight = 0
    for (let aff of potential_affix) {
        total_weight += aff.weight
    }
    let rolled_position = Math.random() * total_weight

    let current_weight = 0
    for (let aff of potential_affix) {
        current_weight = current_weight + aff.weight
        if (current_weight >= rolled_position) {
            item.affixes.push({tag: aff.tag})
            return 'ok'
        }
    }
    return '???'
}

export function roll_affix_weapon(enchant_rating:number, item:Item) {
    let potential_affix = get_potential_affix_weapon(enchant_rating, item)
    return enchant_item(enchant_rating, item, potential_affix)
}

export function roll_affix_armour(enchant_rating:number, item:Item) {
    let potential_affix = get_potential_affix_armour(enchant_rating, item)
    return enchant_item(enchant_rating, item, potential_affix)
}


type AttackModificationFunction = (result: AttackObj) => AttackObj;
type DamageModificationFunction = (result: Damage) => Damage;


function dummy_attack_mod(result: AttackObj) {
    return result
}
function dummy_damage_mod(result: Damage) {
    return result
}

export const attack_affixes_effects:{[_ in affix_tag]?: AttackModificationFunction} = {
    precise: (result: AttackObj) => {
        result.attack_skill += 10
        return result
    },
    of_madness: (result: AttackObj) => {
        result.attacker_status_change.rage +=       50;
        return result
    },
    daemonic: (result: AttackObj) => {
        result.attacker_status_change.stress+=      100;
        result.attacker_status_change.rage +=       100;
        result.attacker_status_change.fatigue +=    100;
        return result
    },
    notched: (result: AttackObj) => {
        result.attacker_status_change.blood += 10;
        result.defender_status_change.blood += 10
        return result
    },
    of_power: dummy_attack_mod
}

export const damage_affixes_effects:{[_ in affix_tag]?: DamageModificationFunction} = {
    sharp: (damage: Damage) => {
        damage.pierce += 5;
        damage.slice += 5
        return damage
    },
    heavy: (damage: Damage) => {
        damage.blunt += 5;
        return damage
    },
    hot: (damage: Damage) => {
        damage.fire += 10
        return damage
    },
    precise: (damage: Damage) => {
        damage.pierce += 10;
        return damage
    },
    of_madness: (damage: Damage) => {
        damage.slice  += 50;
        damage.pierce += 50;
        damage.blunt  += 50
        return damage
    },
    daemonic: (damage: Damage) => {
        damage.fire +=  300;
        return damage
    },
    notched: (damage: Damage) => {
        damage.pierce +=  7 ;
        damage.slice +=   7 ;
        return damage
    },
    of_power: (damage: Damage) => {
        damage.fire += 1;
        return damage
    }
}




export const protection_affixes_effects:{[_ in affix_tag]?: DamageModificationFunction} = {
        thick: (resists: Damage) => {
            resists.fire += 3;
            resists.pierce += 5;
            resists.slice += 10;
            return resists;
        },

        layered: (resists: Damage) => {
            resists.fire += 3;
            resists.pierce += 10;
            return resists;
        },

        of_heat: (resists: Damage) => {
            resists.fire += 10;
            return resists;
        },

        of_power: dummy_damage_mod,

        hard: (resists: Damage) => {
            resists.fire += 2;
            resists.blunt += 3;
            resists.pierce += 3;
            resists.slice += 3;
            return resists
        },

        of_elder_beast: (resists: Damage) => {
            resists.fire +=       5;
            resists.blunt +=      5 ;
            resists.pierce +=     5 ;
            resists.slice +=      5 ;
            return resists
        },

        of_elodino_pleasure: (resists: Damage) => {
            resists.blunt +=     -2 ;
            resists.pierce +=    -2 ;
            resists.slice +=     -2 ;
            resists.fire +=       -2 ;
            return resists
        },

        of_protection: (resists: Damage) => {
            resists.blunt +=     +2 ;
            resists.pierce +=    +2 ;
            resists.slice +=     +2 ;
            resists.fire +=       +2 ;
            return resists
        },

        of_painful_protection: (resists: Damage) => {
            resists.blunt +=     +5 ;
            resists.pierce +=    +5 ;
            resists.slice +=     +5 ;
            resists.fire +=       +5 ;
            return resists
        },

        of_graci_beauty: dummy_damage_mod,
    }

type power_modification = (data: number) => number

export const get_power:{[_ in affix_tag]?: power_modification} = {
        of_power: (data: number) => {
            data += 2
            return data
        }, 
        of_elodino_pleasure: (data: number) => {
            data += 5
            return data
        },
        of_graci_beauty: (data: number) => {
            data += 5
            return data
        }
    }

type character_update_function = (agent: Character) => void

export const update_character:{[_ in affix_tag]?: character_update_function} = {
        of_elder_beast: (agent: Character) => {
            agent.change('stress', 5);
            agent.change('rage', 5 );
            agent.change('hp', 1 );
        },

        of_graci_beauty: (agent: Character) => {
            agent.change('stress', 1);
        },

        of_elodino_pleasure: (agent: Character) => {
            agent.change('stress', 1);
        },

        of_painful_protection: (agent: Character) => {
            agent.change('hp', -1);
        }
    }