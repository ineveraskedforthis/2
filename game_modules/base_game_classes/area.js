const Savings = require("./savings.js");
const Stash = require("./stash.js");
const common = require("../common.js")
const constants = require("../static_data/constants.js");

module.exports = class Area {
    constructor(world) {
        this.world = world
        this.stash = new Stash()
        this.savings = new Savings()

        this.tag = undefined
        this.factions_influence = {}
        this.local_resources = {}
        this.changed = false
    }

    async init(pool, tag, factions_influence, local_resources) {
        this.tag = tag
        this.factions_influence = factions_influence
        this.local_resources = local_resources
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        if (this.changed || this.savings.changed) {
            this.save_to_db(pool)
        }
    }

    set_influence(faction, amount) {
        this.factions_influence[faction.id] = amount
    }

    change_influence(faction, amount) {
        if (faction.id in this.factions_influence) {
            this.faction_influence[faction.id] = this.factions_influence[faction.id] + amount
        } else {
            this.faction_influence[faction.id] = amount
        }
        if (this.factions_influence[faction.id] < 0) {
            this.factions_influence[faction.id] = undefined
        }
        this.changed = true
    }

    get_influence(faction) {
        return this.factions_influence[faction.id]
    }

    async load_to_db(pool) {
        let res = await common.send_query(pool, constants.insert_area_query, [this.tag, this.savings.get_json(), this.stash.get_json(), this.factions_influence, this.local_resources]);
        return res.rows[0].id
    }   

    async save_to_db(pool) {
        this.changed = false
        this.savings.changed = false
        await common.send_query(pool, constants.update_area_query, [this.id, this.tag, this.savings.get_json(), this.stash.get_json(), this.factions_influence, this.local_resources]);
    }

    load_from_json(data) {
        this.id = data.id;
        this.tag = data.tag;
        this.factions_influence = data.factions_influence;
        this.local_resources = data.local_resources;
        this.savings.load_from_json(data.savings)
        this.stash.load_from_json(data.stash)
    }
};