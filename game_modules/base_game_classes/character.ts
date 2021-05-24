const clean = require("./character_actions/clean.js");
const cook_meat = require("./character_actions/cook_meat.js");
const hunt = require("./character_actions/hunt.js");
const move = require("./character_actions/move.js");
const rest = require("./character_actions/rest.js");

import {CharacterGenericPart} from "./character_generic_part.js"

class Character extends CharacterGenericPart {
    async init(pool: any, name: string, cell_id: number, user_id = -1) {
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
        if (dice < 0.1) {
            this.change_stress(1)
        }            
        this.equip.update(this);
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

    async status_check(pool: any) {

        if (this.status.hp <= 0) {
            this.status.hp = 0;
            await this.world.kill(pool, this.id);
        }

        if (this.status.stress >= 100) {
            await this.world.kill(pool, this.id);
        }
    }


    //on action

    async on_move(pool: any) {
        this.change_stress(2);
        // let danger = this.world.constants.ter_danger[tmp];
        // let res = await this.attack_local_monster(pool, danger) 
        return undefined
    }

    async move(pool: any, data: {x: number, y: number}) {}
    async clean() {}
    async rest() {}
    async hunt() {}
    async cook_meat() {}
}

Character.prototype.move = move; 
Character.prototype.clean = clean; 
Character.prototype.rest = rest;
Character.prototype.hunt = hunt;
Character.prototype.cook_meat = cook_meat;

module.exports = Character