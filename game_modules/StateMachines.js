var common = require("./common.js")
var constants = require("./constants.js")

async function buy_input(pool, agent, tag, amount) {
    let savings = agent.savings.get();
    var estimated_tag_cost = agent.get_local_market().guess_tag_cost(tag, amount);
    // if (tag == 'leather') {console.log(tag, amount, Math.min(savings, estimated_tag_cost * 2), agent.data.price)}
    await agent.buy(pool, tag, amount, Math.min(savings, estimated_tag_cost * 2), 100000);
}

async function buy_needs(pool, agent) {
    let size = agent.data.size
    let savings = Math.min(Math.floor(agent.savings.get()/3), 200);

    {
        let food_need = Math.max(0, size - agent.stash.get('food'));
        let money_reserved_for_food = Math.floor(savings * 2/3 * (food_need / size));
        let estimated_food_cost = agent.get_local_market().guess_tag_cost('food', food_need);
        if (estimated_food_cost <= money_reserved_for_food) {
            await agent.buy(pool, 'food', food_need, Math.min(money_reserved_for_food, estimated_food_cost * 3), 100000);
        } else {
            await agent.buy(pool, 'meat', food_need, Math.min(money_reserved_for_food, estimated_food_cost * 2), 100000);
        }
    }

    {
        let clothes_need = Math.max(0, size - agent.stash.get('clothes'));
        let money_reserved_for_clothes = Math.floor(savings * 1/3 * (clothes_need / size));
        let estimated_clothes_cost = agent.get_local_market().guess_tag_cost('clothes', clothes_need);
        if (estimated_clothes_cost <= money_reserved_for_clothes) {
            await agent.buy(pool, 'clothes', size, Math.min(money_reserved_for_clothes, estimated_clothes_cost * 3), 100000)
        } else {
            await agent.buy(pool, 'leather', size, Math.min(money_reserved_for_clothes, estimated_clothes_cost * 2), 100000)
        }
    } 
}

function consume(pool, agent) {
    let size = agent.data.size
    let food_need = size
    let food = agent.stash.get('food');
    agent.stash.inc('food', -food_need);
    food_need -= food;
    if (food_need > 0) {
        agent.stash.inc('meat', -food_need);
    }

    let clothes_need = size;
    let clothes = agent.stash.get('food');
    agent.stash.inc('clothes', -clothes_need);
    clothes_need -= clothes;
    if (clothes_need > 0) {
        agent.stash.inc('leather', -food_need);
    }
}

function produce(pool, agent, tag1, tag2, throughput) {
    let size = agent.data.size
    let input = agent.stash.get(tag1);
    if (input > 0) {
        let production = Math.min(input, size * throughput)
        agent.stash.inc(tag1, -production);
        agent.stash.inc(tag2, production);
    }  
}

function decay(agent) {
    {let tag = 'meat';
    let total = agent.stash.get(tag);
    let decay = Math.floor(total);
    agent.stash.inc(tag, -decay);}

    {let tag = 'food';
    let total = agent.stash.get(tag);
    let decay = Math.floor(total/3);
    agent.stash.inc(tag, -decay);}

    {let tag = 'leather';
    let total = agent.stash.get(tag);
    let decay = Math.floor(total/5);
    agent.stash.inc(tag, -decay);}

    {let tag = 'clothes';
    let total = agent.stash.get(tag);
    let decay = Math.floor(total/100);
    agent.stash.inc(tag, -decay);}
}

function update_price(pool, agent, tag, t) {
    let tmp_price = agent.data.price;
    let tmp_sold = agent.data.sold;
    if (agent.data.sold == 0) {
        agent.data.price -= 1
    } else if ((agent.data.sold * agent.data.price) < (agent.data.prev_sold * agent.data.prev_price)) {
        agent.data.price = agent.data.prev_price
    } else {
        let dice = Math.random();
        if (dice > 0.5) {
            agent.data.price += 1
        } else {
            agent.data.price -= 1
        }
    }

    if ((tag == 'meat') || (tag == 'leather')) {
        if (agent.data.price < 1) {
            agent.data.price = 1
        }
    } else if ((tag == 'food') || (tag == 'clothes')) {
        if (agent.data.price < 2) {
            agent.data.price = 2
        }
    }
    // let market = agent.get_local_market()
    // let estimated_expense = market.guess_tag_cost('food', 1);
    // if (tag == 'food') {
    //     estimated_expense += t * market.guess_tag_cost('meat', t)
    // } else if (tag == 'clothes') {
    //     estimated_expense += t * market.guess_tag_cost('leather', t)
    // }
    
    // if (agent.data.price * t < estimated_expense) {
    //     agent.data.price = Math.floor(estimated_expense / t) + 1
    // }

    agent.data.prev_price = tmp_price;
    agent.data.prev_sold = tmp_sold;
    agent.data.sold = 0
}

class State {
    // eslint-disable-next-line no-unused-vars
    static Enter(pool, agent, save) {
        agent.data.price = 1
        agent.data.prev_price = 0;
        agent.data.prev_sold = 0;
        agent.data.sold = 0
        agent.name = this.tag()
    }
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

    async init(pool, save = true) {
        this.curr_state.Enter(pool, this.owner, save);
    }

    async update(pool, save = true) {
        await this.curr_state.Execute(pool, this.owner, save);
    }

    async change_state(pool, state, save = true) {
        this.prev_state = this.curr_state;
        await this.prev_state.Exit(pool, this.owner, save);
        this.curr_state = state;
        await this.curr_state.Enter(pool, this.owner, save);
    }
}

class WaterSeller extends State {
    static async Execute(pool, agent, save = true) {
        await agent.clear_orders(pool, save);
        // selling water
        let water = agent.stash.get('water');
        if (water > 0) {
            await agent.sell(pool, 'water', water, 10);
        }
    }
    static tag() {
        return 'water'
    }
}

class MeatToHeal extends State {
    static async Execute(pool, agent, save = true) {
        let size = agent.data.size;
        await agent.clear_orders(pool, save);

        update_price(pool, agent, 'food', 2);
        

        await buy_input(pool, agent, 'meat', 2)
        produce(pool, agent, 'meat', 'food', 2)

        // selling food
        let food = Math.max(0, agent.stash.get('food') - size);
        await agent.sell(pool, 'food', food, agent.data.price);
        let savings = agent.savings.get();

        if (savings < 100) {
            agent.AI.change_state(pool, HuntersMeat)
        }
        buy_needs(pool, agent);
        consume(pool, agent);        
    }

    static tag() {
        return 'meat_to_heal';
    }
}

class HuntersMeat extends State {

    static async Execute(pool, agent, save = true) {
        let size = agent.data.size;
        await agent.clear_orders(pool, save)

        update_price(pool, agent, 'meat', 2);
        
        

        //decay
        decay(agent);

        //hunt
        agent.stash.inc('meat', size * 2);

        //sell_meat
        let meat = agent.stash.get('meat');
        if (meat > 0) {
            await agent.sell(pool, 'meat', meat, agent.data.price);
        }

        buy_needs(pool, agent);
        consume(pool, agent);
    }
    
    static tag() {
        return 'hunters_meat'
    }
}

class HuntersLeather extends State {
    static async Execute(pool, agent, save = true) {
        let size = agent.data.size;
        await agent.clear_orders(pool, save)

        update_price(pool, agent, 'leather', 1);
        
        //hunt
        agent.stash.inc('leather', size);

        //sell_leather
        let leather = agent.stash.get('leather');
        if (leather > 0) {
            await agent.sell(pool, 'leather', leather, agent.data.price);
        }

        buy_needs(pool, agent);
        consume(pool, agent);
    }
    
    static tag() {
        return 'hunters_leather'
    }
}

class Clothiers extends State {
    static async Execute(pool, agent, save = true) {
        // let size = agent.data.size;
        await agent.clear_orders(pool, save)

        update_price(pool, agent, 'clothes', 2);

        // console.log('!!!!')
        await buy_input(pool, agent, 'leather', 2)        
        produce(pool, agent, 'leather', 'clothes', 2)

        let clothes = Math.max(0, agent.stash.get('clothes'));
        if (agent.savings.get() > 200) {
            clothes = Math.max(0, clothes - 1);
        }
        await agent.sell(pool, 'clothes', clothes, agent.data.price);

        let savings = agent.savings.get()
        if (savings < 100) {
            agent.AI.change_state(pool, HuntersLeather)
        }
        buy_needs(pool, agent);
        consume(pool, agent);
    }
    
    static tag() {
        return 'clothiers'
    }
}

var AIs = {
    'meat_to_heal': MeatToHeal,
    'hunters_meat': HuntersMeat,
    'hunters_leather': HuntersLeather,
    'clothiers': Clothiers,
    'water': WaterSeller
}

module.exports = {
    State: State,
    StateMachine: StateMachine,
    AIs: AIs
}