var common = require("../common.js");
var constants = require("../static_data/constants.js")
var weapons = require("../static_data/weapons.js")
const spells = require("../static_data/spells.js")

var Equip = require("./equip.js");
var Stash = require("./stash.js");
var Savings = require("./savings.js")
const CharacterGenericPart = require("./character_generic_part.js")


class Character extends CharacterGenericPart {
    constructor(world) {
        this.world = world;
        this.equip = new Equip();
        this.stash = new Stash();
        this.savings = new Savings();
        this.tag = 'chara';

        this.changed = false;
    }

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


    // 

    status_check() {

        if (this.hp <= 0) {
            this.hp = 0;
            await this.world.kill(pool, this.id);
        }

        if (this.data.other.stress >= 100) {
            await this.world.kill(pool, this.id);
        }
    }


    //on action

    async on_move() {
        this.change_stress(3);
    }



}


module.exports = Character