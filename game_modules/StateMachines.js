class State {
    // eslint-disable-next-line no-unused-vars
    static Enter(pool, agent, save) {}
    // eslint-disable-next-line no-unused-vars
    static Execute(pool, agent, save) {}
    // eslint-disable-next-line no-unused-vars
    static Exit(pool, agent, save) {}
    static tag() {
        return null;
    }
}


class StateMachine {
    constructor(owner, state) {
        this.owner = owner;
        this.prev_state = null;
        this.curr_state = state;
    }

    async init(pool, save) {
        this.curr_state.Enter(pool, this.owner, save);
    }

    async update(pool, save) {
        await this.curr_state.Execute(pool, this.owner, save);
    }

    async change_state(pool, state, save) {
        this.prev_state = this.state;
        await this.prev_state.Exit(pool, this.owner, save);
        this.curr_state = state;
        await this.curr_state.Enter(pool, this.owner, save);
    }
}


class BasicPopAIstate extends State {
    static async Execute(pool, agent, save) {
        // let cell = agent.get_cell();
        var savings = agent.savings.get();
        var tmp_food_need = Math.max(agent.get_need('food') - agent.stash.get('food'), 0);
        await agent.clear_orders(pool, save);
        var estimated_food_cost = agent.get_local_market().guess_tag_cost('food', tmp_food_need);
        await agent.buy(pool, 'food', tmp_food_need, Math.min(savings, estimated_food_cost * 3), save);
        for (var tag of agent.world.TAGS) {
            if (tag != 'food') {
                var tmp_need = Math.max(agent.get_need(tag) - agent.stash.get(tag), 0);
                if (tmp_need > 0) {
                    var estimated_tag_cost = agent.get_local_market().guess_tag_cost(tag, tmp_need);
                    var money_to_spend_on_tag = Math.min(savings, Math.max(estimated_tag_cost, Math.floor(savings * 0.1)));
                    await agent.buy(pool, tag, tmp_need, money_to_spend_on_tag, save);
                }
            }
        }
        //update desire to change work
    }

    tag() {
        return 'basic_pop_ai_state';
    }
}

class BasicEnterpriseAIstate extends State {
    // static async Execute(pool, agent, save) {
    //     var market = agent.get_local_market();
    //     for (var i in agent.data.input) {
    //         await agent.clear_orders(pool, i, save = false);
    //     }
    //     for (var i in agent.data.output) {
    //         await agent.clear_orders(pool, i, save = false);
    //     }
    //     // correct prices
    //     var amount = agent.data.output[tag];
    //     var tmp_pure_income = null;
    //     var tdworkers = 0;
    //     var tdprice = {};
    //     tdprice[tag] = 0;
    //     var i = 0;
    //     var t_x = 0;
    //     var t_planned_spendings = 0;
    //     while (i < Math.pow(3, agent.data.output.length)) {
    //         var tmp = i;
    //         var dprice = {};
    //         var no_profit = false;
    //         for (var tag in agent.data.output) {
    //             dprice[tag] = (tmp % 3 - 1) // tmp acts here as trit mask
    //             tmp = Math.floor(tmp / 3);
    //             if (agent.data.price[tag] + dprice[tag] <= 0) {
    //                 no_profit = true
    //             }
    //         }
    //         if (no_profit) {
    //             i += 1;
    //             continue;
    //         }
    //         for (var dworkers = 0; dworkers <= 1; dworkers++) {
    //             if ((agent.size + dworkers > agent.data.max_size) || (agent.size + dworkers <= 0)) {
    //                 continue
    //             }
    //             var planned_workers = agent.data.size + dworkers;
    //             var expected_income = {};
    //             var planned_price = {};
    //             var max_income = {};
    //             for (var z in agent.data.output) {
    //                 expected_income[z] = 0;
    //                 planned_price[z] = agent.data.price[z] + dprice[z];
    //                 var total_cost_of_produced_goods = planned_workers * agent.get_production_per_worker() * planned_price[z];
    //                 max_income[z] = market.planned_money_to_spent[z] - market.get_total_cost_of_placed_goods_with_price_less_or_equal(z, planned_price[z], taxes = true);
    //                 expected_income[z] = Math.min(max_income[z], total_cost_of_goods);
    //             }

    //             var total_income = 0;
    //             for (var z in agent.data.output) {
    //                 total_income += expected_income[z];
    //             }
    //             var x = market.find_amount_of_goods_for_buying(planned_workers * agent.get_input_consumption_per_worker(), Math.floor(agent.data.savings.get() / 2), agent.data.input);
    //             var tmp_total_input = {};
    //             for (var z in agent.data.input) {
    //                 tmp_total_input[z] = agent.data.input[z] * x;
    //             }
    //             var input_cost = market.guess_cost(tmp_total_input);
    //             var salary_spendings = agent.data.size * agent.salary;
    //             var planned_income = total_income;
    //             var planned_spendings = planned_workers * agent.salary + inputs_cost;
    //             var planned_pure_income = planned_income - planned_spendings;
    //             if ((tmp_pure_income == null) || ((tmp_pure_income < planned_pure_income))) {
    //                 t_x = x;
    //                 tdprice = dprice;
    //                 tdworkers = dworkers;
    //                 tmp_pure_income = planned_pure_income;
    //                 t_planned_spendings = planned_spendings;
    //             }
    //         }
    //         i += 1;
    //     }
    //     // saving changes
    //     for (var tag in agent.data.output) {
    //         agent.price[tag] += tdprice[tag];
    //     }
    //     agent.set_size(agent.data.size + dworkers);
    //     //seling output with updated prices and buying input
    //     for (var tag in agent.data.output) {
    //         await agent.sell(pool, tag, agent.stash.get(tag), agent.price[tag], save = false);
    //     }
    //     for (var tag in agent.data.input) {
    //         await agent.buy(pool, tag, agent.data.input[tag] * t_x, market.guess_tag_cost(tag, agent.data.input[tag] * t_x) * 2, save = false);
    //     }
    //     await agent.pay_salary(pool, save = false);
    //     await agent.pay_profits(pool, save = false);
    //     await agent.save_to_db(pool, save);
    // }

    // tag() {
    //     return 'basic_enterprise_ai_state';
    // }
}

module.exports = {
    State: State,
    StateMachine: StateMachine,
    BasicPopAIstate: BasicPopAIstate,
    BasicEnterpriseAIstate: BasicEnterpriseAIstate
}