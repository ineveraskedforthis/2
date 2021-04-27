var common = require("../common.js");
var constants = require("../static_data/constants.js")
var weapons = require("../static_data/weapons.js")
const spells = require("../static_data/spells.js")

var Equip = require("./equip.js");
var Stash = require("./stash.js");
var Savings = require("./savings.js")
const CharacterGenericPart = require("./character_generic_part.js")


class Character2 extends CharacterGenericPart {
    constructor(world) {
        this.world = world;
        this.equip = new Equip();
        this.stash = new Stash();
        this.savings = new Savings();
        this.tag = 'chara';

        this.changed = false;
    }

    battle_update() {
        let dice = Math.random()
        if (dice < this.data.base_battle_stats.stress_battle_generation) {
            this.change_stress(1)
        }            
        this.equip.update(pool, this);
    }

    out_of_battle_update() {
        if (this.data.dead) {
            return
        }

        let reg = this.get_hp_change();
        this.change_hp(pool, reg, false);
        let rage_change = this.get_rage_change()
        this.change_rage(rage_change);
        let d_stress = this.get_stress_change()
        this.change_stress(d_stress)

        
        await this.update_status(pool, false);
    }

    status_check() {

        if (this.hp <= 0) {
            this.hp = 0;
            await this.world.kill(pool, this.id);
        }

        if (this.data.other.stress >= 100) {
            await this.world.kill(pool, this.id);
        }
    }


}



module.exports = class Character {
    constructor(world) {
        this.world = world;
        this.equip = new Equip();
        this.stash = new Stash();
        this.savings = new Savings();
        this.tag = 'chara';

        this.changed = false;
    }

    

    get_tag() {
        return 'test'
    }

    async init(pool, name, cell_id, user_id = -1) {
        this.init_base_values(name, 100, 100, 0, 0, cell_id, user_id);
        this.id = await this.load_to_db(pool);
        await this.save_to_db(pool);
        return this.id;
    }
    
    

    //on_action

    async on_move() {
        this.change_stress(3);
    }    


    //actions
    async level_up(pool, save) {
        while (this.data.exp >= common.get_next_nevel_req(this.data.level)) {
            this.data.exp -= common.get_next_nevel_req(this.data.level);
            this.data.level += 1;
            this.data.skill_points += 1;
        }
        if (save) {
            await this.save_to_db(pool);
        }
    }
    
    eat(pool) {
        if (!this.data.in_battle) {
            let tmp = this.stash.get('food');
            if (tmp > 0) {
                this.change_hp(pool, 10);
                this.stash.inc('food', -1);
            }
        }
        this.changed = true;
    }

    clean(pool) {
        if (!this.data.in_battle) {
            let tmp = this.stash.get('water');
            if (tmp > 0) {
                this.change_blood(-20);
                this.stash.inc('water', -1);
            }
        }
    }

    async attack_local_monster(pool, enemies) {
        let battle = await this.world.attack_local_monster(pool, this, enemies);
        return battle
    }

    async attack_local_outpost(pool) {
        let battle = await this.world.attack_local_outpost(pool, this);
        return battle
    }

    //craft actions

    async craft_food(pool) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('cook' in this.data.skills)) {
            let tmp = this.stash.get('meat');
            if (tmp > 0) {
                this.stash.inc('meat', -1);
                let chance = this.get_craft_food_chance();
                let dice = Math.random()
                let stress_gained = this.calculate_gained_failed_craft_stress('food');
                if (dice < chance) {
                    this.stash.inc('food', +1);
                    this.change_stress(Math.floor(stress_gained / 2));
                    res = 'ok'
                } else {
                    this.change_stress(stress_gained);
                    res = 'failed'
                }     
                this.changed = true;       
            } 
            else {
                res = 'not_enough_meat'
            }
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('cook' in this.data.skills)) {
            res = 'skill_cook_is_not_learnt'
        }
        return res
    }

    get_craft_food_chance() {
        let chance = 0.0;
        if ('cook' in this.data.skills) {
            chance += this.data.skills['cook'] * 0.2
        }
        return chance
    }

    async craft_clothes(pool) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('sewing' in this.data.skills)) {
            let tmp = this.stash.get('leather');
            if (tmp > 0) {
                this.stash.inc('leather', -1);
                this.stash.inc('clothes', +1);
                let stress_gained = this.calculate_gained_failed_craft_stress('clothes');
                this.change_stress(stress_gained);
                this.changed = true;
            } else {
                res = 'not_enough_leather'
            }
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('sewing' in this.data.skills)) {
            res = 'skill_sewing_is_not_learnt'
        }
        return res
    }

    async enchant(pool, index) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('enchanting' in this.data.skills)) {
            let item = this.equip.data.backpack[index]
            if (item == undefined) {
                res = 'no_selected_item'
                return res
            }
            let tmp = this.stash.get('zaz');
            if (tmp > 0) {
                this.stash.inc('zaz', -1);
                this.world.roll_affixes(this.equip.data.backpack[index], 5);
                let stress_gained = this.calculate_gained_failed_craft_stress('enchanting');
                this.change_stress(stress_gained);
            } else {
                res = 'not_enough_zaz'
            }
            this.changed = true;
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('enchanting' in this.data.skills)) {
            res = 'skill_enchanting_is_not_learnt'
        }
        return res
    }

    async disenchant(pool, index) {
        let res = 'ok';
        if ((!this.data.in_battle) & ('disenchanting' in this.data.skills)) {
            let item = this.equip.data.backpack[index]
            if (item == undefined) {
                res = 'no_selected_item'
                return res
            }
            this.equip.data.backpack[index] = undefined;
            let dice = Math.random();
            if (dice > 0.9) {
                this.stash.inc('zaz', +1);
            }
            let stress_gained = this.calculate_gained_failed_craft_stress('disenchanting');
            this.change_stress(stress_gained);
            this.changed = true;   
        } else if (this.data.in_battle) {
            res = 'in_battle'
        } else if (!('disenchanting' in this.data.skills)) {
            res = 'skill_disenchanting_is_not_learnt'
        }
        return res
    }

    //craft misc
    calculate_gained_failed_craft_stress(tag) {
        let total = 15;
        if ('less_stress_from_crafting' in this.data.skills) {
            total -= this.data.skills['less_stress_from_crafting'] * 3;
        }
        if (tag == 'food') {
            if ('less_stress_from_making_food' in this.data.skills) {
                total -= this.data.skills['less_stress_from_making_food'] * 5
            }
        }
        if (tag == 'enchanting') {
            if ('less_stress_from_enchanting' in this.data.skills) {
                total -= this.data.skills['less_stress_from_enchanting'] * 5
            }
        }
        if (tag == 'disenchanting') {
            if ('less_stress_from_disenchanting' in this.data.skills) {
                total -= this.data.skills['less_stress_from_disenchanting'] * 5
            }
        }
        total = Math.max(0, total)
        return total;
    }


    add_quest(quest, tag) {
        this.data.quest = {id: quest.id, tag: tag}
        this.savings.transfer(quest.savings, this.savings.get())
    }
}