const Savings = require("./savings.js");
const Stash = require("./stash.js");
const common = require("../common.js")
const {constants} = require("../static_data/constants.js");

module.exports = class Quest {
    constructor(world) {
        this.world = world
        this.money = new Savings()
        this.stash = new Stash()
        this.required_item_tag = 'unknown'
        this.reward_money = 0
        this.reward_reputation = 0
    }

    async init(pool, item, reward_money, reward_reputation) {
        this.required_item_tag = item
        this.reward_money = reward_money
        this.reward_reputation = reward_reputation
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
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            // @ts-ignore: Unreachable code error
            global.last_id += 1
            // @ts-ignore: Unreachable code error
            return global.last_id
        }
        let res = await common.send_query(pool, constants.insert_quest_query, [this.money.get_json(), this.stash.get_json(), this.required_item_tag, this.reward_money, this.reward_reputation]);
        return res.rows[0].id
    }

    async save_to_db(pool) {
        this.changed = false
        this.savings.changed = false
        await common.send_query(pool, constants.update_quest_query, [this.id, this.money.get_json(), this.stash.get_json(), this.required_item_tag, this.reward_money, this.reward_reputation]);
    }

    load_from_json(data) {
        this.money.load_from_json(data.money)
        this.stash.load_from_json(data.stash)
        this.required_item_tag = data.required_item_tag;
        this.reward_money = data.reward_money;
        this.reward_reputation = data.reward_reputation;

        this.tag = data.tag;
        this.id = data.id;
    }
}