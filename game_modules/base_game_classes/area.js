
const {Stash} = require("./stash.js");
const common = require("../common.js")
const {constants} = require("../static_data/constants.js");
const { Savings } = require("./savings.js");

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

     init(pool, tag, factions_influence, local_resources) {
        this.tag = tag
        this.factions_influence = factions_influence
        this.local_resources = local_resources
        this.id =  this.load_to_db(pool);
        return this.id;
    }

     update(pool) {
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

     load_to_db(pool) {
        if (global.flag_nodb) {
            global.last_id += 1
            return global.last_id
        }
        let res =  common.send_query(pool, constants.insert_area_query, [this.tag, this.savings.get_json(), this.stash.get_json(), this.factions_influence, this.local_resources]);
        return res.rows[0].id
    }   

     save_to_db(pool) {
        this.changed = false
        this.savings.changed = false
         common.send_query(pool, constants.update_area_query, [this.id, this.tag, this.savings.get_json(), this.stash.get_json(), this.factions_influence, this.local_resources]);
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