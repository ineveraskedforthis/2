var common = require("../common.js");
var constants = require("../constants.js")

var Stash = require("../stash.js");
var Savings = require("../savings.js")

module.exports = class Agent {
    init_base_values(world, id, cell_id, name = null) {
        this.world = world;
        this.id = id;
        this.cell_id = cell_id;
        this.name = name;
        this.update_name();
        this.savings = new Savings;
        this.stash = new Stash;
        this.type = 'agent';
    }

    update_name() {
        if (this.name == null) {
            this.name = 'agent ' + this.id;
        }
    }

    async init(pool, world, cell_id, name = null) {
        var id = await world.get_new_id(pool, 'agent_id');
        this.init_base_values(world, id, cell_id, name);
        await this.load_to_db(pool);
    }

    async update(pool, save = true) {
        this.savings.update();
        await this.save_to_db(pool, save);
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.insert_agent_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json()]);
    }

    async save_to_db(pool, save = true) {
        if (!save) {
            return
        }
        await common.send_query(pool, constants.update_agent_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json()]);
    }

    async load_from_json(pool, world, data) {
        this.world = world;
        this.id = data.id;
        this.cell_id = data.cell_id;
        this.name = data.name;
        this.savings = new Savings();
        this.savings.load_from_json(data.savings);
        this.stash = new Stash();
        this.stash.load_from_json(data.stash);
    }

    async transfer(pool, target, tag, x, save = true, save_target = true) {
        this.stash.transfer(target.stash, tag, x);
        await target.save_to_db(pool, save_target);
        await this.save_to_db(pool, save);
    }

    async transfer_all(pool, target, save = true, save_target = true) {
        for (var tag of this.world.TAGS) {
            var x = this.stash.get(tag);
            await this.transfer(pool, target, tag, x, save = false, save_target = false);
        }
        await this.save_to_db(pool, save);
        await target.save_to_db(pool, save_target)
    }

    async buy(pool, tag, amount, money, max_price = null) {
        await this.get_local_market().buy(pool, tag, this, amount, money, max_price);
    }

    async sell(pool, tag, amount, price) {
        await this.get_local_market().sell(pool, tag, this, amount, price);
    }

    async clear_tag_orders(pool, tag, save_market = true) {
        await this.get_local_market().clear_agent_orders(pool, this, tag, save_market)
    }

    async clear_orders(pool, save_market = true) {
        for (var tag of this.world.TAGS) {
            await this.clear_tag_orders(pool, tag, save_market)
        }
    }

    get_local_market() {
        var cell = this.world.get_cell_by_id(this.cell_id);
        return cell.market;
    }

    get_name() {
        return this.name;
    }

    get_cell() {
        return this.world.get_cell_by_id(this.cell_id)
    }
}