import { battle_id, unit_id } from "../../../../shared/battle_data";
import { Accuracy } from "../battle/battle_calcs";
import { Battle } from "../battle/classes/battle";
import { BattleEvent } from "../battle/events";
import { BattleSystem } from "../battle/system";
import { trim } from "../calculations/basic_functions";
import { Attack } from "../attack/system";
import { Character } from "../character/character";
import { ModelVariant, building_id, char_id } from "../types";
import { Loot } from "../races/generate_loot";
import { Perks } from "../character/Perks";
import { perk_requirement } from "../character/perk_requirement";
import { perk_price } from "../prices/perk_base_price";
import { CharacterSystem } from "../character/system";
import { CharacterTemplate } from "../character/templates";
import { UI_Part } from "../client_communication/causality_graph";
import { Alerts } from "../client_communication/network_actions/alerts";
import { UserManagement } from "../client_communication/user_manager";
import { Data } from "../data";
import { ARROW_BONE, materials, material_index, RAT_SKIN, ZAZ, WOOD } from "../manager_classes/materials_manager";
import { Cell } from "../map/cell";
import { MapSystem } from "../map/system";
import { Convert, Link, Unlink } from "../systems_communication";
import { cell_id, damage_type, weapon_attack_tag } from "../types";
import { Effect } from "./effects";
import { EventInventory } from "./inventory_events";
import { EventMarket } from "./market";
import { AttackObj } from "../attack/class";
import { DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { skill } from "../character/SkillList";
import { skill_price } from "../prices/skill_price";
import { ScriptedValue } from "./scripted_values";
import { BuildingType } from "../DATA_LAYOUT_BUILDING";
import { on_craft_update } from "../craft/helpers";

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

        Effect.Transfer.savings(student, teacher, price)
        Effect.learn_perk(student, perk)
    }

    export function buy_skill(student: Character, skill: skill, teacher: Character) {
        let savings = student.savings.get()
        let price = skill_price(skill, student, teacher)

        if (savings < price) {
            Alerts.not_enough_to_character(student, 'money', price, savings)
            return
        }
        
        if (teacher.skills[skill] <= student.skills[skill] + 20) return
        if (teacher.skills[skill] < 30) return

        Effect.Transfer.savings(student, teacher, price)
        Effect.Change.skill(student, skill, 1)
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
            Effect.Change.fatigue(character, 5)
        } else {
            const durability = character.equip.data.armour.foot.durability
            Effect.Change.fatigue(character, Math.round(trim(5 - 4 * (durability / 100), 1, 5)))
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

        let user = Convert.character_to_user(character)
        if (user == undefined) return
        Alerts.log_to_user(user, 'rat scent ' + new_cell.rat_scent)
    }

    export function new_character(template:CharacterTemplate, name: string|undefined, starting_cell: cell_id, model: ModelVariant|undefined) {
        console.log('creating new character')
        console.log(name)
        let character = CharacterSystem.template_to_character(template, name, starting_cell)
        if (model == undefined) model = {chin: 0, mouth: 0, eyes: 0}
        character.set_model_variation(model)
        const cell = MapSystem.SAFE_id_to_cell(starting_cell)
        Link.character_and_cell(character, cell)

        Data.CharacterDB.save()
        return character
    }

    function ranged_dodge(attack: AttackObj, defender: Character, flag_dodge: boolean) {
        // evasion helps against arrows better than in melee
        // 100 evasion - 2 * attack skill = 100% of arrows are missing
        // evaded attack does not rise skill of attacker
        // dodge is an active evasion
        // it gives base 10% of arrows missing
        // and you rise your evasion if you are attacked
        const attack_skill = 2 * attack.attack_skill
        const evasion = defender.skills.evasion

        let evasion_chance = evasion / (100 + attack_skill)
        if (flag_dodge) evasion_chance = evasion_chance + 0.1

        const evasion_roll = Math.random()
        if (evasion_roll < evasion_chance) {
            attack.flags.miss = true
            return 'miss'
        }

        if (flag_dodge) {
            const dice_evasion_skill_up = Math.random()
            if (dice_evasion_skill_up > evasion_chance) {
                Effect.Change.skill(defender, 'evasion', 1)
            }
        }
    }

    export function shoot(attacker: Character, defender: Character, distance: number, flag_dodge: boolean): 'ok'|'no_ammo'|'miss' {
        // sanity checks
        if (defender.get_hp() == 0) return 'miss'
        if (attacker.get_hp() == 0) return 'miss'
        if (attacker.stash.get(ARROW_BONE) < 1) {Alerts.not_enough_to_character(attacker, 'arrow', 1, 0); return 'no_ammo'}

        Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id)
        //remove arrow
        change_stash(attacker, ARROW_BONE, -1)

        //check missed attack because of lack of skill
        const acc = Accuracy.ranged(attacker, distance)
        const dice_accuracy = Math.random()
        if (dice_accuracy > acc) { 
            const dice_skill_up = Math.random()
            if (dice_skill_up * 100 > attacker.skills.ranged) {
                Effect.Change.skill(attacker, 'ranged', 1)
            }
            return 'miss' 
        }

        const dice_skill_up = Math.random()
        if (dice_skill_up * 50 > attacker.skills.ranged) {
            Effect.Change.skill(attacker, 'ranged', 1)
        }

        // create attack
        const attack = Attack.generate_ranged(attacker)

        // durability changes weapon
        const roll_weapon = Math.random()
        if (roll_weapon < 0.2) {
            Effect.change_durability(attacker, 'weapon', -1)
        }

        const responce = ranged_dodge(attack, defender, flag_dodge)
        
        if (responce == 'miss') {
            DmgOps.mult_ip(attack.damage, 0)
        } else {
            const roll = Math.random()
            if (roll < 0.5) Effect.change_durability(defender, 'body', -1);
            else if (roll < 0.7) Effect.change_durability(defender, 'legs', -1)
            else if (roll < 0.8) Effect.change_durability(defender, 'foot', -1)
            else if (roll < 0.9) Effect.change_durability(defender, 'head', -1)
            else Effect.change_durability(defender, 'arms', -1)
        }

        //apply status to attack
        attack.attacker_status_change.fatigue += 5
        attack.defender_status_change.fatigue += 5
        attack.defender_status_change.stress += 3

        attack.defence_skill += defender.skills.evasion
        
        deal_damage(defender, attack, attacker)

        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }

        return 'ok'
    }

    export function magic_bolt(attacker: Character, defender: Character, dist: number, flag_dodge: boolean) {
        if (defender.dead()) return 'miss'
        if (attacker.dead()) return 'miss'

        Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id)

        const BLOOD_COST = 10

        // managing costs
        if (attacker.stash.get(ZAZ) > 0) Event.change_stash(attacker, ZAZ, -1)
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

        const attack = Attack.generate_magic_bolt(attacker, dist)
        attack.defender_status_change.stress += 5

        deal_damage(defender, attack, attacker);

        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }

        return 'ok'
    }

    function deal_damage(defender: Character, attack: AttackObj, attacker: Character) {
        const total = CharacterSystem.damage(defender, attack.damage);
        defender.change_status(attack.defender_status_change);
        attacker.change_status(attack.attacker_status_change);

        const resistance = CharacterSystem.resistance(defender)

        Alerts.log_attack(defender, attack, resistance, total, 'defender')
        Alerts.log_attack(attacker, attack, resistance, total, 'attacker')

        UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.STATUS);
        UserManagement.add_user_to_update_queue(attacker.user_id, UI_Part.STATUS);
    }

    export function attack(attacker: Character, defender: Character, dodge_flag: boolean, attack_type: damage_type) {
        if (attacker.dead()) return
        if (defender.dead()) return
        const attack = Attack.generate_melee(attacker, attack_type)

        //status changes for melee attack
        attack.attacker_status_change.rage += 5
        attack.attacker_status_change.fatigue += 5
        attack.defender_status_change.rage += 3
        attack.defender_status_change.stress += 1

        Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id)
        
        //calculating defense skill
        evade(defender, attack, dodge_flag);
        block(defender, attack);
        parry(defender, attack);

        //calculating improvement to skill
        attack_skill_improvement(attacker, defender, attack);
        
        //breaking items
        attack_affect_durability(attacker, defender, attack);   

        //applying defense and attack skill
        let damage_modifier = (40 + attack.attack_skill) / (40 + attack.defence_skill)
        DmgOps.mult_ip(attack.damage, damage_modifier)

        // console.log('attack after modification')
        // console.log(attack)

        //apply damage and status effect after all modifiers
        deal_damage(defender, attack, attacker)

        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender)
        }
    }

    function attack_affect_durability(attacker: Character, defender: Character, attack: AttackObj) {
        if (!attack.flags.miss) {
            const durability_roll = Math.random();
            if (durability_roll < 0.5)
                Effect.change_durability(attacker, 'weapon', -1);

            if (attack.flags.blocked) {
                Effect.change_durability(defender, 'weapon', -1);
            } else {
                const roll = Math.random();
                if (roll < 0.5)
                    Effect.change_durability(defender, 'body', -1);
                else if (roll < 0.7)
                    Effect.change_durability(defender, 'legs', -1);
                else if (roll < 0.8)
                    Effect.change_durability(defender, 'foot', -1);
                else if (roll < 0.9)
                    Effect.change_durability(defender, 'head', -1);
                else
                    Effect.change_durability(defender, 'arms', -1);
            }
        }
    }

    function attack_skill_improvement(attacker: Character, defender: Character, attack: AttackObj) {
        // if attacker skill is lower than total defence skill of attack, then attacker can improve
        if (attack.attack_skill < attack.defence_skill) {
            const improvement_rate = (100 + attack.defence_skill) / (100 + attack.attack_skill)
            if (improvement_rate > 1) {
                Effect.Change.skill(attacker, attack.weapon_type, Math.floor(improvement_rate))
            } else {
                const dice = Math.random();
                if (dice < improvement_rate)
                    Effect.Change.skill(attacker, attack.weapon_type, 1);
            }            
        }

        //fighting provides constant growth of this skill up to some level
        //for defender
        const dice = Math.random();
        if ((dice < 0.5) && (attack.attack_skill <= 30)) {
            Effect.Change.skill(defender, CharacterSystem.melee_weapon_type(defender), 1);
        }
        //for attacker
        const dice2 = Math.random();
        if ((dice2 < 0.5) && (attack.attack_skill <= 30)) {
            Effect.Change.skill(attacker, attack.weapon_type, 1);
        }
    }

    function parry(defender: Character, attack: AttackObj) {
        const weapon = CharacterSystem.melee_weapon_type(defender);
        const skill = defender.skills[weapon] + Math.round(Math.random() * 5);
        attack.defence_skill += skill;

        // roll parry
        const parry_dice = Math.random()
        if ((skill > attack.attack_skill)) {
            attack.defence_skill += 40
            attack.flags.blocked = true;
        }

        //fighting provides constant growth of this skill up to some level
        if (skill < attack.attack_skill) {
            Effect.Change.skill(defender, weapon, 1);
        }

        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 10)) {
            Effect.Change.skill(defender, weapon, 1);
        }
    }

    function block(defender: Character, attack: AttackObj) {
        const skill = defender.skills.blocking + Math.round(Math.random() * 10);
        attack.defence_skill += skill;

        // roll block
        const block_dice = Math.random()
        if (block_dice * skill > attack.defence_skill) {
            attack.flags.blocked = true
        }

        //fighting provides constant growth of this skill
        if (skill < attack.attack_skill) {
            Effect.Change.skill(defender, 'blocking', 1);
        }

        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 20)) {
            Effect.Change.skill(defender, 'blocking', 1);
        }
    }

    function evade(defender: Character, attack: AttackObj, dodge_flag: boolean) {
        //this skill has quite wide deviation
        const skill = trim(defender.skills.evasion + Math.round((Math.random() - 0.5) * 40), 0, 200);

        //passive evasion
        attack.defence_skill += skill;

        //active dodge
        if (dodge_flag) {
            attack.flags.miss = true
            attack.defence_skill += 50
        }

        // roll miss
        const block_dice = Math.random()
        if (block_dice * skill > attack.defence_skill) {
            attack.flags.miss = true
        }

        //fighting provides constant growth of this skill
        if (skill < attack.attack_skill) {
            Effect.Change.skill(defender, 'evasion', 1);
        }

        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 10)) {
            Effect.Change.skill(defender, 'evasion', 1);
        }
    }

    export function kill(killer: Character, victim: Character) {
        console.log(killer.name + ' kills ' + victim.name)
        death(victim)

        if (killer.id == victim.id) {
            return
        }

        const loot = CharacterSystem.rgo_check(victim)
        CharacterSystem.transfer_all(victim, killer)
        for (const item of loot) {
            Event.change_stash(killer, item.material, item.amount)
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
                Event.change_stash(killer, RAT_SKIN, skin)
            } else {
                Effect.Change.skill(killer, 'skinning', 1)
            }
        }

        if (victim.current_building != undefined) {
            Effect.leave_room(victim.id)
        }

        Data.Buildings.remove_ownership_character(victim.id)

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

    export function change_stash(character: Character, tag: material_index, amount: number) {
        character.stash.inc(tag, amount)
        let user = Convert.character_to_user(character)
        if (user == undefined) return
        Alerts.log_to_user(user, `change ${materials.index_to_material(tag).string_tag} by ${amount}. Now: ${character.stash.get(tag)}`)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
    }

    export function support_in_battle(character: Character, target: Character) {
        console.log('attempt to support in battle')

        if (character.id == target.id) return undefined
        if (!target.in_battle()) return
        if (character.cell_id != target.cell_id) {return undefined}
        console.log('validated')

        const battle = Convert.character_to_battle(target)
        if (battle == undefined) return
        const unit_target = Convert.character_to_unit(target)
        if (unit_target == undefined) return

        join_battle(character, battle, unit_target.team)
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
            // let team = AIhelper.check_team_to_join(attacker, battle, unit_def.team)
            // if (team == 'no_interest') team = Math.random()
            let team = BattleSystem.get_empty_team(battle)
            join_battle(attacker, battle, team)
        } else {
            const battle_id = BattleSystem.create_battle()
            console.log('new battle: ' + battle_id)
            const battle = Convert.id_to_battle(battle_id)
            join_battle(defender, battle, 0)
            join_battle(attacker, battle, 1)
        }
    }

    export function join_battle(agent: Character, battle: Battle, team: number) {
        if (agent.in_battle()) {return}
        const unit = BattleSystem.create_unit(agent, team, battle)
        BattleEvent.NewUnit(battle, unit)
        Link.character_battle_unit(agent, battle, unit)
        Alerts.battle_update_data(battle)
        UserManagement.add_user_to_update_queue(agent.user_id, UI_Part.BATTLE)
    }

    export function stop_battle(battle: Battle) {
        battle.ended = true
        for (let unit of Object.values(battle.heap.data)) {
            const character = Convert.unit_to_character(unit)
            
            if (character != undefined) {
                character.battle_id = -1 as battle_id
                character.battle_unit_id = -1 as unit_id
            }

            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BATTLE)
        }
    }

    export function build_building(character: Character, type: BuildingType) {
        let cost = ScriptedValue.building_price_wood(type)
        let rooms = ScriptedValue.building_rooms(type)

        if (character.stash.get(WOOD) < cost) return

        change_stash(character, WOOD, -cost)
        Effect.new_building(character.cell_id, type, rooms, character.skills.woodwork)
    }

    export function repair_building(character: Character, builing_id: building_id) {
        let building = Data.Buildings.from_id(builing_id)
        let skill = character.skills.woodwork
        let repair = Math.min(5, skill - building.durability)
        if (repair <= 0) return;
        let cost = Math.round(repair / 100 * ScriptedValue.building_price_wood(building.type) / 2 + 0.51)
        if (cost > character.stash.get(WOOD)) return;

        let difficulty = Math.floor(building.durability / 3 + 10)
        on_craft_update(character, [{skill: 'woodwork', difficulty: difficulty}])
        change_stash(character, WOOD, -cost)
        Effect.building_repair(building, repair)        
    }
}