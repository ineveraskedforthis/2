const clean = require("./character_actions/clean.js");
const cook_meat = require("./character_actions/cook_meat.js");
const hunt = require("./character_actions/hunt.js");
const move = require("./character_actions/move.js");
const rest = require("./character_actions/rest.js");
const CharacterGenericPart = require("./character_generic_part.js")


class Character extends CharacterGenericPart {
    async init(pool, name, cell_id, user_id = -1) {
        this.init_base_values(name, cell_id, user_id);
        this.id = await this.load_to_db(pool);
        await this.save_to_db(pool);
        return this.id;
    }  


    // tag 

    get_tag() {
        return 'test'
    }


    // update ticks

    battle_update() {
        let dice = Math.random()
        if (dice < this.data.base_battle_stats.stress_battle_generation) {
            this.change_stress(1)
        }            
        this.equip.update(pool, this);
    }

    out_of_battle_update() {
        if (this.is_dead()) {
            return
        }

        let reg = this.get_hp_change();
        this.change_hp(reg);
        let rage_change = this.get_rage_change()
        this.change_rage(rage_change);
        let d_stress = this.get_stress_change()
        this.change_stress(d_stress);
    }

    get_stress_change() {
        return 0
    }


    // 

    async status_check(pool) {

        if (this.status.hp <= 0) {
            this.status.hp = 0;
            await this.world.kill(pool, this.id);
        }

        if (this.status.stress >= 100) {
            await this.world.kill(pool, this.id);
        }
    }


    //on action

    async on_move(pool) {
        this.change_stress(2);
        // let danger = this.world.constants.ter_danger[tmp];
        // let res = await this.attack_local_monster(pool, danger) 
        return undefined
    }
}

Character.prototype.move = move; 
Character.prototype.clean = clean; 
Character.prototype.rest = rest;
Character.prototype.hunt = hunt;
Character.prototype.cook_meat = cook_meat;

module.exports = Character