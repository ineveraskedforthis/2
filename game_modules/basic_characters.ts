var Character = require("./base_game_classes/character")
import {CharacterGenericPart} from './base_game_classes/character_generic_part'

class PredefinedMonster extends CharacterGenericPart {

    async init(pool: any, cell_id: number, name = 'monster') {        
        this.specific_part_of_init(cell_id)
        if (name != null) {
            this.name = name
        }
        this.id = await this.load_to_db(pool);
        await this.load_to_db(pool);
        return this.id;
    }

    specific_part_of_init(cell_id: number) {

    }
}

class Rat extends PredefinedMonster {

    specific_part_of_init(cell_id: number) {
        this.init_base_values('rat', cell_id);
        this.status.hp = 30
        this.stats.max.hp = 30
        this.stats.magic_power = 0
        this.stats.phys_power = 4
        this.equip.data.right_hand = {tag: 'empty', affixes: 1, a0: {tag: 'sharp', tier: 1}}
        this.stash.inc('meat', 1);
        this.misc.model = 'rat'
    }

    get_range() {
        return 1
    }

    get_tag() {
        return 'rat'
    }
    get_item_lvl() {
        return 2;
    }
}

class Elodino extends PredefinedMonster  {
    specific_part_of_init(cell_id: number) {
        this.init_base_values('elodino', cell_id);
        this.equip.data.right_hand = {tag: 'empty', affixes: 1, a0: {tag: 'sharp', tier: 2}}
        this.stash.inc('meat', 2);
        this.misc.model = 'elodino'
    }

    get_range() {
        return 1
    }

    get_tag() {
        return 'elodino'
    }
    get_item_lvl() {
        return 5;
    }
}

class Graci extends PredefinedMonster  {
    specific_part_of_init(cell_id: number) {
        this.init_base_values('graci', cell_id);
        this.status.hp = 200
        this.stats.max.hp = 200
        this.stats.phys_power = 20
        this.equip.data.right_hand = {tag: 'empty', affixes: 1, a0: {tag: 'sharp', tier: 2}}
        this.misc.model = 'graci'
    }

    get_tag() {
        return 'graci'
    }

    get_item_lvl() {
        return 10;
    }

    get_range() {
        return 2
    }

    change_rage(x: number) {
    }

    change_blood(x: number) {
    }
}



module.exports = {
    rat: Rat,
    graci: Graci,
    elodino: Elodino,
}