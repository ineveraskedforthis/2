const Savings = require("./savings");
const Stash = require("./stash");

module.exports = class Quest {
    constructor(world, item, reward_money, reward_reputation) {
        this.world = world
        this.money = new Savings()
        this.stash = new Stash()

        this.required_item_tag = item
        this.reward_money = reward_money
        this.reward_reputation = reward_reputation
    }

    async init(pool) {
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async update(pool) {
        if (this.changed) (
            this.save_to_db(pool)
        )
    }

    async change_reward(reward_money, reward_reputation) {
        this.changed = true
        this.reward_money = reward_money
        this.reward_reputation = reward_reputation
    }

    async load_to_db(pool) {

    }

    async save_to_db(pool) {
        this.changed = false
    }
}