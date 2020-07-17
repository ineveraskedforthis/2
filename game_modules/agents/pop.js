var common = require("../common.js");
var constants = require("../constants.js")

var StateMachine = require("../StateMachines.js").StateMachine
var BasicPopAIstate = require("../StateMachines.js").AIs['basic_pop_ai_state']
var AIs = require("../StateMachines.js").AIs
var Consumer = require("./consumer.js")

module.exports = class Pop extends Consumer {
    constructor(world) {
        super(world);
        this.tag = 'pop'
    }

    init_base_values(id, cell_id, data, race_tag, name = null, AIstate = BasicPopAIstate) {
        super.init_base_values(id, cell_id, data, name);
        this.AI = new StateMachine(this, AIstate);
        this.race_tag = race_tag;
        this.data.growth_mod = 0;
        this.data.death_mod = 0;
        this.data.ai_tag;
        this.data.price = 1;
        this.data.sold = 0;
        this.data.prev_sold = 0;
        this.data.prev_price = 0;
    }

    async init(pool, cell_id, size, needs, race_tag, name = null, AIstate = BasicPopAIstate) {
        var id = await this.world.get_new_id(pool, 'agent_id');
        this.init_base_values(id, cell_id, {'size': size, 'needs': needs}, race_tag, name, AIstate);
        await this.load_to_db(pool);
    }

    async update(pool, growth_flag = false, save = true) {
        if (this.data.size.current == 0) {
            return
        }
        super.update(pool, false);
        this.data.death_mod += this.world.get_tick_death_rate(this.race_tag);
        if (growth_flag) {
            this.growth_update(pool, false);
            this.data.growth_mod = 0;
            this.data.death_mod = 0;
        }
        await this.AI.update(pool, false);
        await this.motions_update(pool, false, true);
        await this.save_to_db(pool, save);
    }

    async set_max_size(pool, x, save = true) {
        this.data.size.max = x;
        await this.save_to_db(pool, save);
    }

    async consume(pool, tag, save = true) {
        if (this.data.size.current == 0) {
            return;
        }
        var total_need = Math.floor(this.data.needs[tag] * this.data.size.current);
        var in_stash = Math.min(this.stash.get(tag), total_need);
        if (total_need == 0) {
            return;
        }
        if (tag == 'food') {
            this.data.growth_mod += (2 * in_stash / total_need - 1) * this.world.get_tick_max_growth(this.race_tag);
        }
        await super.consume(pool, tag, false);
        await this.save_to_db(pool, save);
    }

    async growth_update(pool, save) {
        // var size = this.data.size.current
        // var growth = Math.floor(this.data.size.current * (1 + this.data.growth_mod));
        this.data.size.current = Math.floor(this.data.size.current * (1 - this.data.death_mod))
        await this.save_to_db(pool, save);
    }

    // eslint-disable-next-line no-unused-vars
    async motions_update(pool, save = true, save_target = true) {
        return;
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.insert_pop_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.race_tag, this.AI.curr_state.tag()]);
    }

    async save_to_db(pool, save = true) {
        if (save) {
            await common.send_query(pool, constants.update_pop_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.race_tag, this.AI.curr_state.tag()]);
        }
    }

    async load_from_json(data) {
        super.load_from_json(data);
        this.race_tag = data.race_tag;
        console.log(data.ai_tag);
        this.AI = new StateMachine(this, AIs[data.ai_tag]);
    }
}