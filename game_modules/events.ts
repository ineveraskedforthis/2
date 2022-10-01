import { Character } from "./base_game_classes/character/character";
//      attack(target: Character, mod:'fast'|'heavy'|'usual'|'ranged', dodge_flag: boolean, distance: number) {

export namespace Event {

    export function attack(attacker: Character, defender: Character, dodge_flag: boolean) {

        let result = new AttackResult()


        result = this.equip.get_weapon_damage(result, (mod == 'ranged'));
        result = this.mod_attack_damage_with_stats(result, mod);
        result = this.roll_accuracy(result, mod, distance);
        result = this.roll_crit(result);
        result = target.roll_dodge(result, mod, dodge_flag);
        result = target.roll_block(result);


        let dice = Math.random()
        if (dice > this.get_weapon_skill(result.weapon_type) / 50) {
            this.change_weapon_skill(result.weapon_type, 1)
        }
        this.send_skills_update()
        
        result = await target.take_damage(pool, mod, result);
        this.change_status(result.attacker_status_change)

        if (result.flags.killing_strike) {
            target.transfer_all_inv(this)
            target.rgo_check(this)
        }
        return result;
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

    //     result = await target.take_damage(pool, 'ranged', result);
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
    //                     await this.world.entity_manager.remove_orders(pool, this)
    //                     await AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this)
    //                     result.flags.killing_strike = true
    //                 }
    //             }
    //         }
    //         this.change_status(result.defender_status_change)
    //     }
    //     await this.save_to_db(pool)
    //     return result;
    // }
}