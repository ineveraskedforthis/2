import exp from "constants";
import { CharacterGenericPart } from "../base_game_classes/character_generic_part";
import { money } from "../base_game_classes/savings";
import { EntityManager } from "../manager_classes/entity_manager";
import { Armour, ArmourConstructorArgument, Weapon, WeaponConstructorArgument } from "../static_data/item_tags";
import { World } from "../world";

const common = require("../common.js");
const {constants} = require("../static_data/constants.js");
const hour = 1000 * 60 * 60;
const time_intervals = [1000 * 60, hour * 12, hour * 24, hour * 48];



export type auction_id = number & { __brand: "auction_id"}
export type auction_order_id = number & { __brand: "auction_order_id"}

function nodb_mode_id():number|undefined {
    // @ts-ignore: Unreachable code error
    if (global.flag_nodb) {
        // @ts-ignore: Unreachable code error
        global.last_id += 1
        // @ts-ignore: Unreachable code error
        return global.last_id
    }
    return undefined
}

enum AuctionResponce {
    NOT_IN_THE_SAME_CELL = 'not_in_the_same_cell',
    EMPTY_BACKPACK_SLOT = 'empty_backpack_slot',
    OK = 'ok'
}
    

namespace AuctionOrderManagement {
    export async function build_weapon_order(pool: any, owner: CharacterGenericPart, item: Weapon, buyout_price: money, starting_price: money, end_time: number, market_id: auction_id) {
        let order_id = await AuctionOrderManagement.insert_to_db( pool, 
                                                            {meat: item.get_json(), type: 'weapon'},
                                                            owner.id,
                                                            buyout_price,
                                                            starting_price,
                                                            owner.id,
                                                            end_time,
                                                            market_id)
        let order = new OrderItem(item, owner, owner, buyout_price, starting_price, end_time, order_id, market_id)
        return order
    }

    export async function insert_to_db(pool: any,
                                       item: Weapon|Armour, 
                                       owner_id: number, 
                                       buyout_price: money, 
                                       current_price: money, 
                                       latest_bidder: number, 
                                       end_time: number, 
                                       market_id: auction_id): Promise<auction_order_id> {
        let nodb = nodb_mode_id()
        if (nodb != undefined) {
            return nodb as auction_order_id
        }

        let result = await common.send_query(pool, constants.insert_item_order_query, [item.get_json(), owner_id, buyout_price, current_price, latest_bidder, end_time, market_id]);
        return result.rows[0].id as auction_order_id;
    }
    
    export function order_to_json(order: OrderItem) {
        let responce:OrderItemJson = {
            id: order.id,
            item: order.item.get_json(),
            owner_id: order.owner_id,
            owner_name: order.owner.name,
            buyout_price: order.buyout_price,
            current_price: order.current_price,
            latest_bidder_id: order.latest_bidder.id,
            latest_bidder_name: order.latest_bidder.name,
            end_time: order.end_time,
            market_id: order.market_id
        }
        return responce
    }

    export function json_to_order(data: OrderItemJson, entity_manager:EntityManager) {
        let item_data = data.item
        let item = null
        switch(item_data.item_type) {
            case 'armour': item = new Armour(data.item as ArmourConstructorArgument);
            case 'weapon': item = new Weapon(data.item as WeaponConstructorArgument)
        }

        let owner = entity_manager.chars[data.owner_id]
        let latest_bidder = entity_manager.chars[data.latest_bidder_id]

        let order = new OrderItem(item, owner, latest_bidder, data.buyout_price, data.current_price, data.end_time, data.id, data.market_id)

        return order
    }
}

namespace AuctionManagement {
    export async function build(pool: any, cell_id: number): Promise<Auction> {
        let id = await AuctionManagement.insert_to_db(pool)
        let auction = new Auction(id, cell_id)
        return auction
    }

    export async function insert_to_db(pool: any): Promise<auction_id> {
        let nodb = nodb_mode_id()
        if (nodb != undefined) {
            return nodb as auction_id
        }

        let result = await common.send_query(pool, constants.insert_market_items_query, []);
        return result.rows[0].id;
    }

    export async function sell_armour(pool: any, seller: CharacterGenericPart, auction: Auction, backpack_id: number, buyout_price: money, starting_price:money): Promise<{ responce: AuctionResponce; }> {
        if (auction.cell_id != seller.cell_id) {
            return {responce: AuctionResponce.NOT_IN_THE_SAME_CELL}
        }
        
        let item = seller.equip.data.backpack.armours[backpack_id]
        if (item == undefined) {
            return {responce: AuctionResponce.EMPTY_BACKPACK_SLOT}
        }



        return {responce: AuctionResponce.OK}
    }
}

class Auction {
    orders: Set<OrderItem>
    changed: boolean
    cell_id: number
    id: number

    constructor(id: auction_id, cell_id: number) {
        this.id = id
        this.orders = new Set();
        this.changed = false;
        this.cell_id = cell_id
    }

    async sell(pool:any, seller, index, buyout_price, starting_price) {
        let item = seller.equip.data.backpack[index]
        if (item == undefined) {
            return 
        }
        seller.equip.data.backpack[index] = undefined;
        await seller.save_to_db(pool);
        await this.new_order(pool, seller, item, buyout_price, starting_price, 1);
    }

    async new_order(pool, seller, item, buyout_price, starting_price, time_interval) {
        let order = new OrderItem(this.world);
        let time = Date.now();
        let dt = time_intervals[time_interval];
        let id = await order.init(pool, seller, item, buyout_price, starting_price, time + dt)
        this.orders.add(id)
        this.world.add_item_order(order);
        this.CHANGED = true
    }

    async buyout(pool, buyer, id) {
        if (!(this.orders.has(id))) {
            return
        }
        let order = this.world.get_item_order(id);
        if (buyer.savings.get() < order.buyout_price) {
            return
        }
        let item = order.item;
        buyer.savings.transfer(order.owner.savings, order.buyout_price);
        let sm = this.world.socket_manager;
        sm.send_savings_update(buyer);
        sm.send_savings_update(order.owner);
        buyer.equip.add_item(item);
        buyer.save_to_db(pool)
        await order.return_money(pool);
        this.orders.delete(id);
        await order.delete_from_db(pool);
        this.CHANGED = true
    }

    async bid(pool, bidder, new_price, id) {
        if (!(id in this.orders)) {
            return
        }
        let order = this.world.get_item_order(id);
        if ((bidder.savings.get() < new_price) || (new_price <= order.current_price)) {
            return
        }
        if (bidder.id == order.owner_id) {
            return
        }
        await order.return_money()
        bidder.savings.inc(-new_price);
        await order.bid(pool, bidder, new_price);
        await order.save_to_db(pool);
        this.CHANGED = true;
    }

    async resolve(pool, i) {
        let order = this.world.get_item_order(i)
        let item = order.item
        let owner = order.owner;
        let winner = this.world.get_from_id_tag(this.latest_bidder, 'chara');
        if (winner == undefined) {
            if (owner != undefined) {
                owner.equip.add_item(item)
                owner.save_to_db(pool);
                return true
            }
            return true
        }
        winner.equip.add_item(item);
        if (owner != undefined) {
            winner.savings.transfer(owner.savings, this.current_price)
            winner.save_to_db(pool);
            owner.save_to_db(pool);
            return true
        }
        return true
    }

    async update(pool) {
        let now = Date.now();
        for (let i of this.orders) {
            let order = this.world.get_item_order(i);
            if ((order.end_time < now) || (order.owner == undefined)) {
                let resp = this.resolve(pool, i);
                if (resp) {
                    await order.delete_from_db(pool);
                    this.orders.delete(i);
                    this.CHANGED = true;
                }
            }
        }
        if (this.CHANGED) {
            this.save_to_db(pool)
            this.world.socket_manager.send_item_market_update(this)
            this.CHANGED = false;
        }        
    }

    get_orders_list() {
        var tmp = [];
        for (let i of this.orders) {
            let order = this.world.get_item_order(i);
            tmp.push(order.get_json());
        }
        return tmp;
    }

    async load_from_json(data) {
        this.orders = new Set(data.orders);
    }

    async load(pool, id) {
        this.id = id
        let tmp = await common.send_query(pool, constants.select_market_items_by_id_query, [this.id]);
        tmp = tmp.rows[0];
        this.load_from_json(tmp)
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_market_items_query, [this.id, Array.from(this.orders.values())]);
    }

}

interface OrderItemJson {
    item: WeaponConstructorArgument|ArmourConstructorArgument;
    owner_id: number;
    buyout_price: money;
    current_price: money;
    latest_bidder_id: number;
    end_time: number;
    id: auction_order_id;
    owner_name: string;
    latest_bidder_name: string;
    market_id: auction_id;
}

class OrderItem {
    item: Weapon|Armour;
    owner: CharacterGenericPart;
    owner_id: number;
    buyout_price: money;
    current_price: money;
    latest_bidder: CharacterGenericPart;
    end_time: number;
    id: auction_order_id
    market_id: auction_id

    constructor(item: Weapon|Armour, owner: CharacterGenericPart, latest_bidder:CharacterGenericPart, buyout_price: money, current_price: money, end_time: number, id: auction_order_id, market_id: auction_id) {
        this.item = item;
        this.owner = owner;
        this.owner_id = owner.id;
        this.buyout_price = buyout_price;
        this.current_price = current_price;
        this.latest_bidder = latest_bidder;
        this.end_time = end_time;
        this.id = id;
        this.market_id = market_id
    }


    async bid(pool: any, bidder: CharacterGenericPart, new_price: money) {
        if (new_price > this.current_price) {
            this.current_price = new_price;
            this.latest_bidder = bidder;
        }
    }

    async return_money(pool: any) {
        if (this.latest_bidder.id != this.owner_id) {
            this.latest_bidder.savings.inc(this.current_price);
            this.latest_bidder.save_to_db(pool);
            this.current_price = 0 as money;
        }
    }



    async save_to_db(pool) {
        await common.send_query(pool, constants.update_item_order_query, [this.id, this.current_price, this.latest_bidder])
    }

    async delete_from_db(pool) {
        await common.send_query(pool, constants.delete_item_order_query, [this.id]);
    }
}

module.exports = {MarketItems: MarketItems, OrderItem: OrderItem};