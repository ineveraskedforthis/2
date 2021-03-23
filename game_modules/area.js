const Savings = require("./savings");
const Stash = require("./stash");

module.exports = class Area {
    constructor(world, tag, factions_influence, local_resources) {
        this.world = world
        this.stash = new Stash()
        this.savings = new Savings()

        this.tag = tag
        this.factions_influence = factions_influence
        this.local_resources = local_resources
        this.changed = false
    }

    async init(tag) {
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        if (this.changed) {
            this.save_to_db(pool)
        }
    }

    set_influence(faction, amount) {
        this.factions_influence[faction.tag] = amount
    }

    change_influence(faction, amount) {
        if (faction.tag in this.factions_influence) {
            this.faction_influence[faction.tag] = this.factions_influence[faction.tag] + amount
        } else {
            this.faction_influence[faction.tag] = amount
        }
        if (this.factions_influence[faction.tag] < 0) {
            this.factions_influence[faction.tag] = undefined
        }
        this.changed = true
    }

    get_influence(faction) {
        return this.factions_influence[faction.tag]
    }

    load_to_db(pool) {

    }

    save_to_db(pool) {
        this.changed = false
    }
};