module.exports = class Enterprise extends Consumer {
    init_base_values(world, id, cell_id, data, name = null, AIstate = {state: BasicEnterpriseAIstate, tag: 'basic_enterprise_ai_state'}) {
        super.init_base_values(world, id, data, needs, name)
        this.AI = StateMachine(AIstate);
        this.prices = world.create_zero_prices_list();
    }

    async init(pool, world, cell_id, data, name = null, AIstate = {state: BasicEnterpriseAIstate, tag: 'basic_enterprise_ai_state'}) {
        var id = await world.get_new_id('agent_id');
        this.init_base_values(world, id, cell_id, data, name, AIstate);
        this.load_to_db(pool);
    }

    // async add_worker(pool, worker, save = true) {
    //     this.data.workers.push({id: worker.id, type: worker.get_type()});
    //     this.save_to_db(pool, save);
    // }

    async update(pool, save = true) {
        await this.update_workers_count(pool);
        await super.update(pool, false);
        await this.AI.update(pool, false);
        await this.production_update(pool, false);
        await this.save_to_db(pool, save);
    }

    async production_update(pool, save = true) {
        var production_amount = this.get_production_amount();
        for (var i in this.data.input) {
            if (this.data.input[i] != 0) {
                production_amount = Math.min(production_amount, this.stash.get(i) / (this.data.input[i] * this.get_input_eff()));
            }
        }
        for (var i in this.data.input) {
            this.stash.inc(i, Math.floor(production_amount * this.data.input[i] * this.get_input_eff()));
        }
        for (var i in this.data.output) {
            this.stash.inc(i, Math.floor(production_amount * this.data.output[i] * this.get_output_eff()));
        }
        await this.save_to_db(pool, save);
    }

    // async pay_salary(pool, save = true, save_target = true) {
    //     for (var worker_id of this.data.workers_ids) {
    //         worker = world.agents[worker_id];
    //         this.savings.transfer(worker.savings, worker.data.size * this.data.salary);
    //         await worker.save_to_db(pool, save_targets);
    //     }
    //     await.this.save_to_db(pool, save);
    // }

    async pay_salary(pool, save = true, save_target = true) {
        var g = this.cell.get_job_graph();
        prof = h.get_profession(this.data.profession)
        for (data of prof.enterprise_to_worker[this.id]) {
            worker = world.agents[worker_id]
            this.savings.transfer(worker.savings, )
        }
    }

    async pay_profits(pool, save = true, save_targets = true) {
        var inf = this.get_total_influence();
        var payment = Math.floor(this.savings.get() * 0.01);
        for (var owner_info of this.data.owners) {
            owner = world.agents[owner_info.id];
            this.savings.transfer(owner.savings, Math.floor(payment * owner_info.influence / inf));
            await owner.save_to_db(pool, save_targets);
        }
        await this.save_to_db(pool, save);
    }

    get_total_influence() {
        return this.get_active_workers();
    }

    get_output_eff() {
        return this.data.output_eff;
    }

    get_input_eff() {
        return this.data.input_eff;
    }

    get_production_amount() {
        return this.get_active_workers * this.data.throughput;
    }

    get_active_workers() {
        var x = 0;
        for (var worker_id of this.data.workers_ids) {
            var worker = this.world.get_agent(worker_id);
            x += worker.size;
        }
        return x;
    }

    get_production_per_worker() {
        return (1 / this.get_input_eff) * this.data.throughput * this.get_output_eff();
    }

    async load_to_db(pool) {
        await send_query(pool, insert_enterprise_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.AI.curr_state.tag()]);
    }

    async save_to_db(pool, save = true) {
        await send_query(pool, update_enterprise_query, [this.id, this.cell_id, this.name, this.savings.get_json(), this.stash.get_json(), this.data, this.AI.curr_state.tag()]);
    }

    async load_from_json(pool, world, data) {
        super.load_from_json(pool, world, data);
    }
}