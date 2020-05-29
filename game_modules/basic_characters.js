var Character = require("./character.js")

class Rat extends Character {
    async init(pool, cell_id, name = null) {
        var id = await this.world.get_new_id(pool, 'char_id');
        if (name == null) {
            name = 'rat ' + id;
        }
        this.init_base_values(id, name, 10, 10, 0, 0, cell_id);
        this.data.stats = this.world.constants.base_stats.rat
        this.data.base_resists = this.world.constants.base_resists.rat
        this.equip.data.right_hand = 'bite'
        this.stash.inc('food', 1);
        await this.load_to_db(pool);
        return id;
    }

    get_tag() {
        return 'tost'
    }
}

module.exports = {
    Rat: Rat
}