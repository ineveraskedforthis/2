const Savings = require("./savings");

module.exports = class Faction {
    constructor(world) {
        this.world = world;
        this.saving = new Savings()
    }

    async init(pool, tag, starting_position, unitl) {
        this.tag = tag
        this.starting_position = starting_position
        this.unit = unit
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async save_to_db(pool) {
        this.changed = false
    }

    async load_to_db(pool) {
        
    }
}