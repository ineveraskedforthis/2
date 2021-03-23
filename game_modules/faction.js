const Savings = require("./savings");

class Faction {
    constructor(world, tag, starting_position, unit) {
        this.world = world;
        this.saving = new Savings()

        this.tag = tag
        this.starting_position = starting_position
        this.unit = unit
    }

    init(pool) {
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    save_to_db(pool) {
        this.changed = false
    }

    load_to_db(pool) {
        
    }
}

module.exports = {
    Faction: Faction
}