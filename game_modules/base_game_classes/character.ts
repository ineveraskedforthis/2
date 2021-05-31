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
        if (dice < 0.5) {
            this.change_stress(1)
        }            
        this.equip.update(this);
    }

    out_of_battle_update(dt: number) {
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

    //on action
    async on_move(pool: any) {
        this.change_stress(2);
        // let danger = this.world.constants.ter_danger[tmp];
        // let res = await this.attack_local_monster(pool, danger) 
        return undefined
    }
}

module.exports = Character