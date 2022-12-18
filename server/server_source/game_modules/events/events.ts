import { battle_id, unit_id } from "../../../../shared/battle_data";
import { AIhelper } from "../AI/helpers";
import { Accuracy } from "../battle/battle_calcs";
import { Battle } from "../battle/classes/battle";
import { BattleEvent } from "../battle/events";
import { BattleSystem } from "../battle/system";
import { trim } from "../calculations/basic_functions";
import { Attack } from "../character/attack/system";
import { Character } from "../character/character";
import { ModelVariant } from "../character/character_parts";
import { Loot } from "../character/races/generate_loot";
import { skill } from "../character/skills";
import { Perks, perk_price, perk_requirement } from "../character/Perks";
import { CharacterSystem } from "../character/system";
import { CharacterTemplate } from "../character/templates";
import { UI_Part } from "../client_communication/causality_graph";
import { Alerts } from "../client_communication/network_actions/alerts";
import { User } from "../client_communication/user";
import { UserManagement } from "../client_communication/user_manager";
import { character_list, Data } from "../data";
import { ARROW_BONE, material_index, RAT_SKIN, ZAZ } from "../manager_classes/materials_manager";
import { Cell } from "../map/cell";
import { MapSystem } from "../map/system";
import { Convert, Link, Unlink } from "../systems_communication";
import { cell_id, damage_type, weapon_attack_tag } from "../types";
import { Effect } from "./effects";
import { EventInventory } from "./inventory_events";
import { EventMarket } from "./market";

export namespace Event {

    export function buy_perk(student: Character, perk: Perks, teacher: Character) {
        let savings = student.savings.get()
        let price = perk_price(perk, student, teacher)

        if (savings < price) {
            Alerts.not_enough_to_character(student, 'money', price, savings)
            return
        }
        

        let responce = perk_requirement(perk, student)
        if (responce != 'ok') {
            Alerts.generic_character_alert(student, 'alert', responce)
            return
        } 


        student.savings.transfer(teacher.savings, price)

        UserManagement.add_user_to_update_queue(student.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(teacher.user_id, UI_Part.SAVINGS)
        Effect.learn_perk(student, perk)
    }

    export function move(character: Character, new_cell: Cell) {
        // console.log('Character moves to ' + new_cell.x + ' ' + new_cell.y)
        const old_cell = Convert.character_to_cell(character)
        Unlink.character_and_cell(character, old_cell)
        Link.character_and_cell(character, new_cell)

        let probability = 0.5
        if (old_cell.development.wild > 0) probability += 0.1
        if (old_cell.development.wild > 1) probability += 0.1
        if (old_cell.development.urban > 0) probability -= 0.2
        if (old_cell.development.rural > 0) probability -= 0.1

        // effect on fatigue depending on boots
        if (character.equip.data.armour.foot == undefined) {
            character.change('fatigue', 5);
        } else {
            const durability = character.equip.data.armour.foot.durability
            character.change('fatigue', Math.round(trim(5 - 4 * (durability / 100), 1, 5)))
        }

        const dice = Math.random()
        if (dice < probability) {
            Effect.change_durability(character, 'foot', -1)
            
            let skill_dice = Math.random()
            if (skill_dice * skill_dice * skill_dice > character.skills.travelling / 100) {
                Effect.Change.skill(character, 'travelling', 1)
            }
        }

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.MAP)
    }

    export function new_character(template:CharacterTemplate, name: string|undefined, starting_cell: cell_id, model: ModelVariant|undefined) {
        let character = CharacterSystem.template_to_character(template, name, starting_cell)
        if (model == undefined) model = {chin: 0, mouth: 0, eyes: 0}
        character.set_model_variation(model)
        const cell = MapSystem.SAFE_id_to_cell(starting_cell)
        Link.character_and_cell(character, cell)

        CharacterSystem.save()
        return character
    }

    function ranged_dodge(attacker: Character, defender: Character, flag_dodge: boolean) {
        // evasion helps against arrows better than in melee
        // 100 evasion - 2 * attack skill = 100% of arrows are missing
        // evaded attack does not rise skill of attacker
        // dodge is an active evasion
        // it gives base 20% of arrows missing
        // and you rise your evasion if you are attacked
        const attack_skill = 2 * attacker.skills.ranged
        const evasion = defender.skills.evasion
        let evasion_chance = evasion - attack_skill
        if (flag_dodge) evasion_chance = evasion_chance + 0.1
        if (flag_dodge) {
            const dice_evasion_skill_up = Math.random()
            if (dice_evasion_skill_up < attack_skill - evasion) {
                increase_evasion(defender)
            }
        }
        const evasion_roll = Math.random()
        if (evasion_roll < evasion_chance) {
            return 'miss'
        }
    }

    export function shoot(attacker: Character, defender: Character, distance: number, flag_dodge: boolean): 'ok'|'no_ammo'|'miss' {
        // sanity checks
        if (defender.get_hp() == 0) return 'miss'
        if (attacker.get_hp() == 0) return 'miss'
        if (attacker.stash.get(ARROW_BONE) < 1) {Alerts.not_enough_to_character(attacker, 'arrow', 1, 0); return 'no_ammo'}

        //remove arrow
        change_stash(attacker, ARROW_BONE, -1)

        //check missed attack because of lack of skill
        const acc = Accuracy.ranged(attacker, distance)
        const dice_accuracy = Math.random()
        if (dice_accuracy > acc) { 
            const dice_skill_up = Math.random()
            if (dice_skill_up * 100 > attacker.skills.ranged) {
                increase_weapon_skill(attacker, 'ranged')
            }
            return 'miss' 
        }

        const responce = ranged_dodge(attacker, defender, flag_dodge)
        if (responce == 'miss') {
            return 'miss'
        }

        // durability changes
        const roll_weapon = Math.random()
        if (roll_weapon < 0.2) {
            Effect.change_durability(attacker, 'weapon', -1)
        }
        {
            const roll = Math.random()
            if (roll < 0.5) Effect.change_durability(defender, 'body', -1);
            else if (roll < 0.7) Effect.change_durability(defender, 'legs', -1)
            else if (roll < 0.8) Effect.change_durability(defender, 'foot', -1)
            else if (roll < 0.9) Effect.change_durability(defender, 'head', -1)
            else Effect.change_durability(defender, 'arms', -1)
        }

        // create attack
        const attack = Attack.generate_ranged(attacker)
        CharacterSystem.damage(defender, attack.damage)
        UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.STATUS)
        
        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }

        return 'ok'
    }

    export function magic_bolt(attacker: Character, defender: Character, flag_dodge: boolean) {
        if (defender.dead()) return 'miss'
        if (attacker.dead()) return 'miss'

        const BLOOD_COST = 10

        // managing costs
        if (attacker.stash.get(ZAZ) > 0) attacker.stash.inc(ZAZ, -1)
        else if (attacker.status.blood >= BLOOD_COST) attacker.status.blood -= BLOOD_COST
        else {
            const blood = attacker.status.blood;
            const hp = attacker.status.hp;
            if (blood + hp > BLOOD_COST) {
                attacker.status.blood = 0
                attacker.status.hp -= (BLOOD_COST - blood)
            } else {
                attacker.status.hp = 1
            }
        }

        const dice = Math.random()
        if (dice > attacker.skills.magic_mastery / 50) {
            Effect.Change.skill(attacker, 'magic_mastery', 1)
        }

        const attack = Attack.generate_magic_bolt(attacker)
        CharacterSystem.damage(defender, attack.damage)
        UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(attacker.user_id, UI_Part.STATUS)

        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }

        return 'ok'
    }

    export function attack(attacker: Character, defender: Character, dodge_flag: boolean, attack_type: damage_type) {
        if (attacker.dead()) return
        if (defender.dead()) return
        const attack = Attack.generate_melee(attacker, attack_type)
        Attack.defend_against_melee(attack, defender)

        Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id)
        
        {// evasion
            const skill = defender.skills.evasion + Math.round(Math.random() * 2)
            attack.defence_skill += skill

            //active dodge
            if (dodge_flag) {
                attack.flags.miss = true
                Attack.dodge(attack, 50)
                // attempts to evade increase your skill
                if (skill < attack.attack_skill) {
                    increase_evasion(defender)
                }
            }

            //passive evasion
            if (skill > attack.attack_skill) {
                attack.flags.miss = true
                Attack.dodge(attack, skill)
            } else {
                //fighting against stronger enemies provides constant growth of this skill up to some level
                const dice = Math.random()
                if ((dice < 0.01) && (skill <= 15)) {
                    increase_evasion(defender)
                }
            }
        }

        {//block
            const skill = defender.skills.blocking + Math.round(Math.random() * 2)
            attack.defence_skill += skill
            if ((skill > attack.attack_skill)) {
                attack.flags.blocked = true
                let dice = Math.random()
                if (dice * 100 > skill) increase_block(defender)
            }

            Attack.block(attack, skill)

            //fighting provides constant growth of this skill up to some level
            const dice = Math.random()
            if ((dice < 0.01) && (skill <= 15)) {
                increase_block(defender)
            }
        }

        {//weapon mastery
            const weapon = CharacterSystem.melee_weapon_type(defender)
            const skill = defender.skills[weapon] + Math.round(Math.random() * 2)
            attack.defence_skill += skill
            if ((skill > attack.attack_skill)) {
                attack.flags.blocked = true
                let dice = Math.random()
                if (dice * 100 > skill) Effect.Change.skill(defender, weapon, 1)
            }

            //fighting provides constant growth of this skill up to some level
            const dice = Math.random()
            if ((dice < 0.02) && (skill <= 20)) {
                Effect.Change.skill(defender, weapon, 1)
            }
        }

        {//weapon skill update
            // if attacker skill is lower than defence skill, then attacker can improve
            if (attack.attack_skill < attack.defence_skill) {
                const diff = attack.defence_skill - attack.attack_skill
                const dice = Math.random()
                if (dice * 300 < diff) increase_weapon_skill(attacker, attack.weapon_type)
            }

            //fighting provides constant growth of this skill up to some level
            const dice = Math.random()
            if ((dice < 0.02) && (attack.attack_skill <= 30)) {
                increase_weapon_skill(defender, attack.weapon_type)
            }
            const dice2 = Math.random()
            if ((dice2 < 0.02) && (attack.attack_skill <= 30)) {
                increase_weapon_skill(attacker, attack.weapon_type)
            }
        }


        // durability changes
        if (!attack.flags.miss) {
            const durability_roll = Math.random()
            if (durability_roll < 0.5) Effect.change_durability(attacker, 'weapon', -1);
            if (attack.flags.blocked) {Effect.change_durability(defender, 'weapon', -1)} else {
                const roll = Math.random()
                if (roll < 0.5) Effect.change_durability(defender, 'body', -1);
                else if (roll < 0.7) Effect.change_durability(defender, 'legs', -1)
                else if (roll < 0.8) Effect.change_durability(defender, 'foot', -1)
                else if (roll < 0.9) Effect.change_durability(defender, 'head', -1)
                else Effect.change_durability(defender, 'arms', -1)
            }
        }


        

        //apply damage after all modifiers
        // console.log(attack)
        CharacterSystem.damage(defender, attack.damage)
        defender.change_status(attack.defender_status_change)
        attacker.change_status(attack.attacker_status_change)
        
        UserManagement.add_user_to_update_queue(attacker.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.STATUS)

        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }
    }

    export function kill(killer: Character, victim: Character) {
        console.log(killer.name + ' kills ' + victim.name)
        death(victim)

        const loot = CharacterSystem.rgo_check(victim)
        CharacterSystem.transfer_all(victim, killer)
        for (const item of loot) {
            killer.stash.inc(item.material, item.amount)
        }
        // console.log(killer.stash.data)

        //loot items rgo
        // console.log('check items drop')
        const dropped_items = Loot.items(victim.race())
        for (let item of dropped_items) {
            EventInventory.add_item(killer, item)
        } 

        // skinning check
        const skin = Loot.skinning(victim.archetype.race)
        if (skin > 0) {
            const dice = Math.random()
            if (dice < killer.skills.skinning / 100) {
                killer.stash.inc(RAT_SKIN, skin)
            } else {
                increase_skinning(killer)
            }
        }
        UserManagement.add_user_to_update_queue(killer.user_id, UI_Part.STASH)
    }

    export function death(character: Character) {
        // UserManagement.add_user_to_update_queue(character.user_id, "death");

        if (character.cleared) return

        console.log('death of ' + character.name)

        EventMarket.clear_orders(character)

        const user_data = Convert.character_to_user_data(character)
        Unlink.user_data_and_character(user_data, character);

        const battle = Convert.character_to_battle(character)
        Unlink.character_and_battle(character, battle)

        const cell = Convert.character_to_cell(character)
        cell.changed_characters = true
        Unlink.character_and_cell(character, cell)
        character.cleared = true

    }


    export function increase_evasion(character: Character) {
        character.skills.evasion += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.DEFENCE_SKILL)
    }

    export function increase_block(character: Character) {
        character.skills.blocking += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.DEFENCE_SKILL)
    }

    export function increase_skinning(character: Character) {
        character.skills.skinning += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.SKINNING_SKILL)
    }

    export function increase_weapon_skill(character: Character, skill: weapon_attack_tag) {
        character.skills[skill] += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.WEAPON_SKILL)
    }

    export function change_stash(character: Character, tag: material_index, amount: number) {
        character.stash.inc(tag, amount)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
    }

    export function start_battle(attacker: Character, defender: Character) {
        console.log('attempt to start battle')
        if (attacker.id == defender.id) return undefined
        if (attacker.in_battle()) return undefined

        if (attacker.cell_id != defender.cell_id) {return undefined}
        console.log('valid participants')

        // two cases
        // if defender is in battle, attempt to join it against him as a new team
        // else create new battle
        const battle = Convert.character_to_battle(defender)
        const unit_def = Convert.character_to_unit(defender)
        if ((battle != undefined) && (unit_def != undefined)) {
            let team = AIhelper.check_team_to_join(attacker, battle, unit_def.team)
            if (team == 'no_interest') team = Math.random()
            join_battle(attacker, battle, team)
        } else {
            const battle_id = BattleSystem.create_battle()
            console.log('new battle: ' + battle_id)
            const battle = Convert.id_to_battle(battle_id)
            const attacker_unit = BattleSystem.create_unit(attacker, 1)
            const defender_unit = BattleSystem.create_unit(defender, 2)
            BattleEvent.NewUnit(battle, attacker_unit)
            BattleEvent.NewUnit(battle, defender_unit)
            Link.character_battle_unit(attacker, battle, attacker_unit)
            Link.character_battle_unit(defender, battle, defender_unit)
            Alerts.battle_update_data(battle)
            UserManagement.add_user_to_update_queue(attacker.user_id, UI_Part.BATTLE)
            UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.BATTLE)
        }
    }

    export function join_battle(agent: Character, battle: Battle, team: number) {
        if (agent.in_battle()) {return}
        const unit = BattleSystem.create_unit(agent, team)
        BattleEvent.NewUnit(battle, unit)
        Link.character_battle_unit(agent, battle, unit)
        UserManagement.add_user_to_update_queue(agent.user_id, UI_Part.BATTLE)
    }

    export function stop_battle(battle: Battle) {
        battle.ended = true
        for (let unit of battle.heap.raw_data) {
            const character = Convert.unit_to_character(unit)
            
            if (character != undefined) {
                character.battle_id = -1 as battle_id
                character.battle_unit_id = -1 as unit_id
            }

            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BATTLE)
        }
    }

    export function on_craft_update(character: Character, skill: skill, craft_tier: number) {
        const dice = Math.random()
        const current = character.skills[skill]
        // console.log(dice, craft_tier, current, (craft_tier - current) / 100)
        if ((current == 0) || (dice < (craft_tier - current) / 100)) Effect.Change.skill(character, skill, 1)
        Effect.Change.stress(character, 1)
        Effect.Change.fatigue(character, craft_tier)
    }

    //  spell_attack(target: Character, tag: spell_tags) {
    //     let result = new AttackResult()

    //     if (tag == 'bolt') {
    //         let bolt_difficulty = 30
    //         let dice = Math.random() * bolt_difficulty
    //         let skill = this.skills.magic_mastery
    //         if (skill < dice) {
    //             this.skills.magic_mastery += 1
    //         }
    //     }

    //     result = spells[tag](result);
    //     result = this.mod_spell_damage_with_stats(result, tag);

    //     this.change_status(result.attacker_status_change)

    //     result =  target.take_damage(pool, 'ranged', result);
    //     return result;
    // }

    //  take_damage(mod:'fast'|'heavy'|'usual'|'ranged', result: AttackResult): Promise<AttackResult> {
    //     let res:any = this.get_resists();
        
    //     if (!result.flags.evade && !result.flags.miss) {
    //         for (let i of damage_types) {
    //             if (result.damage[i] > 0) {
    //                 let curr_damage = Math.max(0, result.damage[i] - res[i]);
    //                 if ((curr_damage > 0) && ((i == 'slice') || (i == 'pierce')) && !(mod == 'ranged')) {
    //                     result.attacker_status_change.blood += Math.floor(curr_damage / 10)
    //                     result.defender_status_change.blood += Math.floor(curr_damage / 10)
    //                 }
    //                 result.total_damage += curr_damage;
    //                 this.change_hp(-curr_damage);
    //                 if (this.get_hp() == 0) {
    //                      this.world.entity_manager.remove_orders(pool, this)
    //                      AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this)
    //                     result.flags.killing_strike = true
    //                 }
    //             }
    //         }
    //         this.change_status(result.defender_status_change)
    //     }
    //      this.save_to_db(pool)
    //     return result;
    // }
}