var common = require("./common.js")
var constants = require("./static_data/constants.js")

async function buy_input(pool, agent, tag, amount) {
    let savings = agent.savings.get();
    var estimated_tag_cost = agent.get_local_market().guess_tag_cost(tag, amount);
    // if (tag == 'leather') {console.log(tag, amount, Math.min(savings, estimated_tag_cost * 2), agent.data.price)}
    await agent.buy(pool, tag, amount, Math.min(savings, estimated_tag_cost * 2), 19);
}

async function buy_needs(pool, agent) {
    let size = agent.data.size
    let savings = Math.min(Math.floor(agent.savings.get()/3), 1000);

    let f = (tag, x) => agent.get_local_market().guess_tag_cost(tag, x);
    let goods_ratings = {}
    // gp - goods prices
    let gp = {
        'food': f('food', 1),
        'meat': f('meat', 1),
        'clothes': f('clothes', 1),
        'leather': f('leather', 1),
        'tools': f('tools', 1)
    }

    // pf - prestige function, the more expensive the more it bought by rich boys, x - savings, y - price, right now it's pretty silly function
    let pf = (x, y) => 1 / ((x + y) / 20 + 0.1) + (x + y) / 2;

    {
        let tag = 'food';
        let need = Math.max(0, size - agent.stash.get(tag));
        
        //numbers represent how well good is acting as corresponding need
        goods_ratings['food'] = 1.2 / gp['food'] * pf(savings, gp['food']);
        goods_ratings['meat'] = 0.5 / gp['meat'] * pf(savings, gp['meat']);
        goods_ratings['leather'] = 0.1 / gp['leather'] * pf(savings, gp['leather']);
        goods_ratings['clothes'] = 0.1 / gp['clothes'] * pf(savings, gp['clothes']);
        goods_ratings['tools'] = 0.0 / gp['tools'] * pf(savings, gp['tools']);

        for (let i in goods_ratings) {
            if (goods_ratings[tag] < goods_ratings[i]) {
                tag = i;
            }
        }

        // let money_reserved = Math.floor(savings * 2/3 * (need / size));
        let money_reserved = 30;
        let estimated_cost = Math.floor(f(tag, need) * 1.2 + 1);
        await agent.buy(pool, tag, need, Math.min(money_reserved, estimated_cost), money_reserved);
    }

    {
        let tag = 'clothes';
        let need = Math.max(0, size - agent.stash.get(tag));
        
        goods_ratings['food'] = 0.1 / gp['food'] * pf(savings, gp['food']);
        goods_ratings['meat'] = 0.1 / gp['meat'] * pf(savings, gp['meat']);
        goods_ratings['leather'] = 0.6 / gp['leather'] * pf(savings, gp['leather']);
        goods_ratings['clothes'] = 1.2 / gp['clothes'] * pf(savings, gp['clothes']);
        goods_ratings['tools'] = 0.0 / gp['tools'] * pf(savings, gp['tools']);

        for (let i in goods_ratings) {
            if (goods_ratings[tag] < goods_ratings[i]) {
                tag = i;
            }
        }

        // let money_reserved = Math.floor(savings * 2/3 * (need / size));
        let money_reserved = 30;
        let estimated_cost = Math.floor(f(tag, need) * 1.2 + 1);
        await agent.buy(pool, tag, need, Math.min(money_reserved, estimated_cost), money_reserved);
    }

}

function consume(pool, agent) {
    let size = agent.data.size

    //eat
    if (agent.stash.get('food') > 0) {
        agent.stash.inc('food', -1);
    } else if (agent.stash.get('meat') > 0) {
        agent.stash.inc('meat', -1);
    } else if (agent.stash.get('leather') > 0) {
        agent.stash.inc('leather', -1);
    } else if (agent.stash.get('clothes') > 0) {
        agent.stash.inc('clothes', -1);
    }

    //wear
    if (agent.stash.get('clothes') > 0) {
        agent.stash.inc('clothes', -1);
    } else if (agent.stash.get('leather') > 0) {
        agent.stash.inc('leather', -1);
    } else if (agent.stash.get('meat') > 0) {
        agent.stash.inc('meat', -1);
    } else if (agent.stash.get('food') > 0) {
        agent.stash.inc('food', -1);
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
    let decay = Math.floor(total/50);
    agent.stash.inc(tag, -decay);}
}

function update_price(pool, agent, tag, t) {
    let tmp_price = agent.data.price;
    let tmp_sold = agent.data.sold;
    if (agent.data.sold == 0) {
        agent.data.price = Math.floor(agent.data.price * 0.9)
    } else if ((agent.data.sold * agent.data.price) < (agent.data.prev_sold * agent.data.prev_price)) {
        agent.data.price = agent.data.prev_price
    } else {
        let dice = Math.random();
        if (dice > 0.5) {
            if (agent.data.price < 20) {
                agent.data.price += 1
            }            
        } else {
            agent.data.price -= 1
        }
    }

    if (tag == 'hunter') {
        if (agent.data.price < 1) {
            agent.data.price = 1
        }
    } else if ((tag == 'food') || (tag == 'clothes')) {
        if (agent.data.price < 2) {
            agent.data.price = 2
        }
    }

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


// template
// clear orders
// update_price
// decay
// buy_input
// produce
// sell
// buy needs
// consume

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
        
        //decay
        decay(agent);

        await buy_input(pool, agent, 'meat', 2)
        produce(pool, agent, 'meat', 'food', 2)

        // selling food
        let food = Math.max(0, agent.stash.get('food') - size);
        await agent.sell(pool, 'food', food, agent.data.price);
        let savings = agent.savings.get();

        if (savings < 100) {
            agent.AI.change_state(pool, Hunters)
        }
        buy_needs(pool, agent);
        consume(pool, agent);        
    }

    static tag() {
        return 'meat_to_heal';
    }
}

class Hunters extends State {

    static async Execute(pool, agent, save = true) {
        let size = agent.data.size;
        await agent.clear_orders(pool, save)

        let estimated_meat_income = agent.get_local_market().guess_tag_cost('meat', 1);
        let estimated_leather_income = agent.get_local_market().guess_tag_cost('leather', 1);


        if (agent.data.product == undefined) {
            agent.data.product = 'meat'
        }

        if ((estimated_leather_income > estimated_meat_income + agent.savings.get() / 50)&(agent.data.product == 'meat')) {
            if (Math.random() > 0.9) {
                agent.data.product = 'leather';
                agent.name = 'leather'
                agent.data.price = 10;
            }
        } else if ((estimated_meat_income > estimated_leather_income + agent.savings.get() / 50)&(agent.data.product == 'leather')) {
            if (Math.random() > 0.9) {
                agent.data.product = 'meat';
                agent.name = 'meat'
                agent.data.price = 10;
            }
        }

        update_price(pool, agent, 'hunter', 2);        

        //decay
        decay(agent);

        //hunt
        agent.stash.inc(agent.data.product, size * 2);

        //sell
        let product = agent.stash.get(agent.data.product);
        if (product > 0) {
            await agent.sell(pool, agent.data.product, product, agent.data.price);
        }

        buy_needs(pool, agent);
        consume(pool, agent);
    }
    
    static tag() {
        return 'hunters'
    }
}

class Clothiers extends State {
    static async Execute(pool, agent, save = true) {
        // let size = agent.data.size;
        await agent.clear_orders(pool, save);

        update_price(pool, agent, 'clothes', 2);

        //decay
        decay(agent);

        // console.log('!!!!')
        await buy_input(pool, agent, 'leather', 2);
        produce(pool, agent, 'leather', 'clothes', 2);

        let clothes = Math.max(0, agent.stash.get('clothes'));
        if (agent.savings.get() > 200) {
            clothes = Math.max(0, clothes - 1);
        }
        await agent.sell(pool, 'clothes', clothes, agent.data.price);

        let savings = agent.savings.get()
        if (savings < 100) {
            agent.AI.change_state(pool, Hunters);
        }
        buy_needs(pool, agent);
        consume(pool, agent);
    }
    
    static tag() {
        return 'clothiers'
    }
}


class Toolmakers extends State {
    static async Execute(pool, agent, save = true) {
        await agent.clear_orders(pool, save);
        let tag = 'tools';
        update_price(pool, agent, tag, 1);
        decay(agent);
        agent.stash.inc(tag, 1);
        let tag_amount = Math.max(0, agent.stash.get(tag));
        await agent.sell(pool, tag, tag_amount, agent.data.price);
        buy_needs(pool, agent);
        consume(pool, agent);
    }

    static tag() {
        return 'toolmakers'
    }
}

class LeatherArmourMakers extends State {
    static async Execute(pool, agent, save = true) {
        await agent.clear_orders(pool, save);
        let tag = 'leather';
        let savings = agent.savings.get();
        await agent.buy(pool, tag, 20, savings, 100);
        while (agent.stash.get(tag) > 5) {
            agent.stash.inc(tag, -5);

        } 
    }
}

var AIs = {
    'meat_to_heal': MeatToHeal,
    'hunters': Hunters,
    'clothiers': Clothiers,
    'water': WaterSeller,
    'toolmakers': Toolmakers,
    'armleather': LeatherArmourMakers
}

module.exports = {
    State: State,
    StateMachine: StateMachine,
    AIs: AIs
}