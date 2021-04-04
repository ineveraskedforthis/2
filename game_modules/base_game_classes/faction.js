const Savings = require("./savings.js");
var common = require("../common.js");
const constants = require("../static_data/constants.js");

module.exports = class Faction {
    constructor(world) {
        this.world = world;
        this.savings = new Savings()
        this.changed = false;
        this.leader_id = -1;
    }

    async init(pool, tag) {
        this.tag = tag
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        if (this.changed || this.savings.changed) {
            this.save_to_db(pool)
        }
    }

    set_leader(char) {
        this.leader_id = char.id;
        this.changed = true;
    }   

    async save_to_db(pool) {
        this.changed = false
        this.savings.changed = false
        await common.send_query(pool, constants.update_faction_query, [this.id, this.savings.get_json(), this.leader_id]);
    }

    async load_to_db(pool) {
        let res = await common.send_query(pool, constants.insert_faction_query, [this.tag, this.savings.get_json(), this.leader_id]);
        return res.rows[0].id
    }    

    load_from_json(data) {
        this.tag = data.tag
        this.savings.load_from_json(data.savings)
        this.id = data.id;
        this.leader_id = data.leader_id
    }
}