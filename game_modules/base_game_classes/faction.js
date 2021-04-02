const Savings = require("./savings");

module.exports = class Faction {
    constructor(world) {
        this.world = world;
        this.saving = new Savings()
        this.changed = false;
    }

    async update(pool) {
        if (this.changed || this.savings.changed) {
            this.save_to_db(pool)
        }
    }

    async init(pool, tag) {
        this.tag = tag
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async save_to_db(pool) {
        this.changed = false
        this.savings.changed = false
        await common.send_query(pool, constants.update_area_query, [this.id, this.savings.get_json()]);
    }

    async load_to_db(pool) {
        let res = await common.send_query(pool, constants.insert_area_query, [this.tag, this.savings.get_json()]);
        return res.rows[0].id
    }

    load_from_json(data) {
        this.tag = data.tag
        this.savings.load_from_json(data.savings)
        this.id = data.id;
    }
}