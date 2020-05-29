var common = require("../common.js");
var constants = require("../constants.js")

var Agent = require("./agent.js");
var Stash = require("../stash.js");
var Savings = require("../savings.js");

module.exports = 
class Consumer extends Agent {
    constructor(world) {
        super(world);
        this.tag = 'consu'
    }
    
    init_base_values(id, cell_id, data, name = null) {
        super.init_base_values(id, cell_id, name);
        this.data = data;
    }

    update_name() {
        if (this.name == null) {
            this.name = 'consumer ' + this.id;
        }
    }

    get_need(tag) {
        return this.data.needs[tag] * this.data.size
    }

    async init(pool, cell_id, data, name = null) {
        var id = await this.world.get_new_id('consumer');
        this.init_base_values(id, cell_id, data, name);
        await this.load_to_db(pool);
    }

    async update(pool, save = true) {
        await super.update(pool, false);
        await this.consume_update(pool, false);
        await this.save_to_db(pool, save);
    }

    async set_size(pool, x, save = true) {
        if (this.data.size.max != null) {
            this.data.size.current = Math.min(x, this.data.size.max);
        } else {
            this.data.size.current = x;
        }
        await this.save_to_db(pool, save);
    }

    async set_max_size(pool, x, save = true) {
        this.data.size.max = x;
        await this.save_to_db(pool, save);
    }

    async transfer_size(pool, target, x, save = true, target_save = true) {
        var tmp = Math.min(x, this.data.size.current);
        this.data.size.current -= tmp;
        target.data.size.current += tmp;
        await this.save_to_db(pool, save)
        await target.save_to_db(pool, target_save)
    }

    async consume_update(pool, save = true) {
        for (var i in this.data.needs) {
            this.consume(pool, i, false);
        }
        await this.save_to_db(pool, save);
    }

    async consume(pool, tag, save = true) {
        this.stash.inc(tag, -this.get_need(tag));
        await this.save_to_db(pool, save);
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.insert_consumer_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data]);
    }

    async save_to_db(pool) {
        if (!this.save) {
            return
        }
        await common.send_query(pool, constants.update_consumer_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data]);
    }

    async load_from_json(data) {
        this.id = data.id;
        this.cell_id = data.cell_id;
        this.name = data.name;
        this.savings.load_from_json(data.savings);
        this.stash.load_from_json(data.stash);
        this.data = data.data;
    }
}