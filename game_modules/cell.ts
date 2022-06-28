var Market = require("./market/market.js")
var common = require("./common.js")
import { CharacterGenericPart } from "./base_game_classes/character_generic_part.js";
import { material_index } from "./manager_classes/materials_manager.js";
import { MarketOrder, market_order_index } from "./market/market_order.js";
import {constants} from "./static_data/constants.js";
import { World } from "./world.js";


interface Development {
    rural: 0|1|2|3;
    urban: 0|1|2|3;
    wild: 0|1|2|3;
    ruins: 0|1|2|3;
    wastelands: 0|1|2|3;
    rupture?: 0|1
}

interface CellResources {
    water: boolean;
    prey: boolean;
    forest: boolean;
    fish: boolean
}

interface Actions {
    hunt: boolean
    rest: boolean
    clean: boolean
}

export class Cell {

    world: World;
    map:any;
    i: number;
    j: number;
    id: number;
    tag: string;
    name: string;

    market_id: number;
    item_market_id: number;
    visited_recently: boolean;
    last_visit: number

    development: Development;
    resources: CellResources;
    characters_list: Set<number>
    orders: Set<market_order_index>

    constructor(world: any, map: any, i: number, j:number, name:string, development: Development, res: CellResources) {
        this.world = world;
        this.map = map;
        this.i = i;
        this.j = j;
        this.id = world.get_cell_id_by_x_y(i, j);
        this.tag = 'cell';
        this.name = name;
        this.visited_recently = false;
        this.last_visit = 0;
        this.market_id = -1
        this.item_market_id = -1
        this.orders = new Set()

        this.characters_list = new Set()

        if (development == undefined) {
            this.development = {rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0};
        } else {
            this.development = development
        }

        if (res == undefined) {
            this.resources = {water: false, prey: false, forest: false, fish: false}
        } else {
            this.resources = res
        }
    }


    get_characters_list(): {id: number, name:string}[] {
        let result = []
        for (let item of this.characters_list.values()) {
            let return_item = {id: item, name: this.world.entity_manager.chars[item].name}
            result.push(return_item)
        }
        return result
    }

    enter(char: CharacterGenericPart) {
        this.characters_list.add(char.id)
        this.world.socket_manager.send_market_info_character(this, char)
    }

    exit(char: CharacterGenericPart) {
        this.characters_list.delete(char.id)
    }


    async init(pool:any) {
        await this.load_to_db(pool);
    }

    has_market() {
        return false
    }

    

    get_actions(): Actions {
        let actions: Actions = {
            hunt: false,
            rest: false,
            clean: false
        }

        actions.hunt = this.can_hunt()
        actions.clean = this.can_clean()
        actions.rest = this.can_rest()
        return actions
    }

    can_clean(): boolean{
        return (this.resources.water)
    }

    can_hunt(): boolean{
        return ((this.development.wild > 0) || (this.resources.prey))
    }

    can_rest(): boolean{
        return (this.development.urban > 0)
    }

    get_item_market() {
        return undefined
    }

    get_market() {
        return undefined
    }

    visit() {
        this.visited_recently = true
        this.last_visit = 0
    }

    add_order(x: market_order_index) {
        this.orders.add(x)
        this.world.socket_manager.send_market_info(this)
    }

    remove_order(x: market_order_index) {
        this.orders.delete(x)
        this.world.socket_manager.send_market_info(this)
    }

    transfer_order(ord: market_order_index, target_cell: Cell) {
        this.remove_order(ord)
        target_cell.add_order(ord)
    }

    async execute_sell_order(pool: any, order_index:market_order_index, amount: number, buyer: CharacterGenericPart) {
        let order = this.world.entity_manager.get_order(order_index)
        let order_owner = order.owner

        if ((order_owner != undefined) && (order.amount >= amount)){
            order.amount -= amount;
            order_owner.transfer(buyer.stash, order.tag, amount);
            buyer.savings.transfer(order_owner.trade_savings, amount * order.price);

            buyer.changed = true;
            order_owner.changed = true;

            await order.save_to_db(pool);
            return amount * order.price;
        }
        
        return 0
    }

    async execute_buy_order(pool: any, order_index:market_order_index, amount: number, seller: CharacterGenericPart) {
        let order = this.world.entity_manager.get_order(order_index)
        let order_owner = order.owner
        
        if ((order_owner != undefined) && (order.amount >= amount)) {

            order.amount -= amount;
            seller.stash.transfer(order_owner.trade_stash, order.tag, amount);
            order_owner.savings.transfer(seller, amount);

            seller.changed = true;
            order_owner.changed = true;

            await order.save_to_db(pool);
            return amount * order.price;
        }
        
        return 0
    }

    async new_order(pool: any, typ: 'sell'|'buy', tag:material_index, amount:number, price:number, agent: CharacterGenericPart) {
        amount = Math.floor(amount);
        price = Math.floor(price);
        if (typ == 'sell') {
            var tmp = agent.stash.transfer(agent.trade_stash, tag, amount);
            var order = await this.world.entity_manager.generate_order(pool, typ, tag, agent, tmp, price, this.id)
            return order
        }

        if (typ == 'buy') {
            if (price != 0) {
                let savings = agent.savings.get();
                let true_amount = Math.min(amount, Math.floor(savings / price));
                agent.savings.transfer(agent.trade_savings, true_amount * price);
                let order = await this.world.entity_manager.generate_order(pool, typ, tag, agent, true_amount, price, this.id)
                return order
            } else {
                let order = await this.world.entity_manager.generate_order(pool, typ, tag, agent, amount, price, this.id)
                return order
            }
        }
    }

    async update(pool:any, dt: number) {
        if (this.visited_recently) {
            this.last_visit += dt
            if (this.last_visit > 10) {
                this.visited_recently = false
                this.last_visit = 0
            }
        }
        // if (this.market.changed) {
        //     this.world.socket_manager.send_market_info(this)
        // }
        // await this.market.update(pool);
        // await this.item_market.update(pool);
    }

    async update_info(pool:any) {
        // await this.market.update_info(pool);
    }

    async clear_dead_orders(pool:any) {
        // await this.market.clear_dead_orders(pool)
    }

    get_population() {
        // return this.job_graph.get_total_size();
    }

    async set_owner(pool:any, owner:any) {
        // this.owner = owner;
        // await common.send_query(pool, constants.update_cell_owner_query, owner);
    }

    // async get_pops_list(pool) {
    //     var tmp = [this.pop];
    //     return tmp;
    // }

    async load(pool:any) {
        let tmp = await common.send_query(pool, constants.select_cell_by_id_query, [this.id]);
        tmp = tmp.rows[0];

        this.name = tmp.name;

        this.market_id = tmp.market_id;
        this.item_market_id = tmp.item_market_id;

        this.development = tmp.development
        this.resources = tmp.resources
    }

    async load_to_db(pool:any) {
        await common.send_query(pool, constants.new_cell_query, [
            this.id,
            this.i, 
            this.j, 
            this.name, 

            this.market_id, 
            this.item_market_id,

            this.development,
            this.resources
        ]);
    }
}