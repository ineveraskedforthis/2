class ProfessionGraph {
    async init(pool, world, professions) {
        this.world = world;
        this.professions = professions;
    }

    get_total_size() {
        var size = 0;
        for (var prof of this.professions) {
            size += prof.get_total_size();
        }
        return size;
    }

    async update(pool) {
        for (var i of this.professions) {
            await i.update(pool);
        }

        for (var i of this.professions) {
            for (var k of i.edges) {
                var j = this.professions[k];
                await this.push(pool, i, j);
            }
        }
    }

    async push(pool, i, j) {
        // if i pops have more savings that j then there is no point in changing prof from i to j
        if ((j.get_average_savings() <= i.get_average_savings()) || (j.is_full)) {
            return;
        }
        actions = [];
        //iterate over i agents
        for (var agent_id of i.agents_ids) {
            let agent = this.world.agents[agent_id];
            if (agent.data.size == 0) {
                continue;
            }
            //iterate over j enterprises
            if (agent.is_pop) {
                target = -1
                max_s = 0
                for (var enterprise_id of j.enterprises_ids) {
                    let enterprise = this.world.agents[enterprise_id];
                    if (enterprise.is_full()) {
                        continue;
                    }
                    if (enterprise.get_active_workers() < enterprise.data.size) {
                        for (var z of enterprise.workers_ids) {
                            var agent2 = this.world.agents[z];
                            if (agent2.is_pop() && agent2.race_tag == agent.race_tag && max_s < agent2.get_savings_per_capita()) {
                                target = agent2
                                max_s = agent2.get_savings_per_capita()
                            }
                        }
                    }
                }
                if (target != -1) {
                    agent.transfer_size(target, 1)
                }
            }
        }
    }
}