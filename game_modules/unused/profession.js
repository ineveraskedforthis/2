// very raw and unfinished

module.exports = class Profession {
    async init(pool, world, tag, edges) {
        this.world = world;
        this.tag = tag;
        this.edges = edges;
        this.agents_ids = Set();
        this.enterprises_ids = Set();
    }

    get_total_size() {
        var size = 0;
        for (a of this.agents_ids) {
            size += this.world.agents[a].size;
        }
        return size;
    }

    get_job_places() {
        let tmp = 0
        for (a of this.enterprises_ids) {
            tmp += this.world.agents[a].size;
        }
        return tmp
    }    

    is_full() {
        if (this.get_total_size() >= this.get_job_places()) {
            return true
        }
        return false
    }

    get_average_savings() {
        var total_savings = 0;
        var total_size = 0;
        for (var agent_id of this.agents_ids) {
            var agent = this.world.agents[agent_id];
            total_savings += agent.get_true_savings();
            total_size += agent.data.size;
        }
        if (total_size == 0) {
            return 1000;
        }
        return Math.floor(total_savings / total_size);
    }
}