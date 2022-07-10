import { CharacterGenericPart } from "../base_game_classes/character_generic_part";
import { money, Savings } from "../base_game_classes/savings";
import { EntityManager } from "../manager_classes/entity_manager";
import { SocketManager } from "../manager_classes/socket_manager";
import { Armour, ArmourConstructorArgument, Weapon, WeaponConstructorArgument } from "../static_data/item_tags";

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

export function nodb_mode_check():boolean {
    // @ts-ignore: Unreachable code error
    return global.flag_nodb
}

enum AuctionResponce {
    NOT_IN_THE_SAME_CELL = 'not_in_the_same_cell',
    EMPTY_BACKPACK_SLOT = 'empty_backpack_slot',
    NO_SUCH_ORDER = 'no_such_order',
    OK = 'ok',
    NOT_ENOUGH_MONEY = 'not_enough_money',
    INVALID_ORDER = 'invalid_order'
}
    

export namespace AuctionOrderManagement {
    export async function build_order(pool: any, owner: CharacterGenericPart, latest_bidder: CharacterGenericPart, item: Weapon|Armour, buyout_price: money, starting_price: money, end_time: number, market_id: auction_id, flags: OrderFlags) {
        let order_id = await AuctionOrderManagement.insert_to_db( pool, 
                                                            item,
                                                            owner.id,
                                                            buyout_price,
                                                            starting_price,
                                                            owner.id,
                                                            end_time,
                                                            market_id)
        let order = new OrderItem(item, owner, latest_bidder, buyout_price, starting_price, end_time, order_id, market_id, flags)
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
            market_id: order.market_id,
            flags: order.flags
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

        let order = new OrderItem(item, owner, latest_bidder, data.buyout_price, data.current_price, data.end_time, data.id, data.market_id, data.flags)

        return order
    }

    export async function save_db(pool: any, order: OrderItem) {
        await common.send_query(pool, constants.update_item_order_query, [order.id, order.current_price, order.latest_bidder.id])
    }

    export async function delete_db(pool: any, order: OrderItem) {
        await common.send_query(pool, constants.delete_item_order_query, [order.id]);
    }

    export async function check_order(pool: any, order: OrderItem) {
        if (order.dead()) {
            AuctionOrderManagement.delete_db(pool, order)
            return true
        }
        return false
    }
}

export namespace AuctionManagement {
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

    export async function sell(pool: any, seller: CharacterGenericPart, auction: Auction, type: 'armour'|'weapon', backpack_id: number, buyout_price: money, starting_price:money): Promise<{ responce: AuctionResponce; }> {
        if (auction.cell_id != seller.cell_id) {
            return {responce: AuctionResponce.NOT_IN_THE_SAME_CELL}
        }

        let item = null

        switch(type){
            case 'armour': item = seller.equip.data.backpack.armours[backpack_id];break;
            case 'weapon': item = seller.equip.data.backpack.weapons[backpack_id];break;
        }
        

        if (item == undefined) {
            return {responce: AuctionResponce.EMPTY_BACKPACK_SLOT}
        }

        let time = Date.now() + time_intervals[1]

        let order = await AuctionOrderManagement.build_order(   pool, 
                                                                seller, 
                                                                seller, 
                                                                item, 
                                                                buyout_price, 
                                                                starting_price, 
                                                                time, 
                                                                auction.id, 
                                                                {   finished: false, 
                                                                    item_sent:false, 
                                                                    profit_sent: false})
        auction.add_order(order) 

        return {responce: AuctionResponce.OK}
    }

    export async function save(pool: any, market: Auction) {
        if (nodb_mode_check()) {
            return
        }

        if (market.changed) {
            await common.send_query(pool, constants.update_market_items_query, [market.id, Array.from(market.orders.values()), market.cell_id]);
        }
    }

    export async function load(pool: any, id: auction_id) {
        if (nodb_mode_check()) {
            return
        }

        let tmp = await common.send_query(pool, constants.select_market_items_by_id_query, [id]);
        tmp = tmp.rows[0];
        let auction = new Auction(id, tmp.cell_id)
        auction.set_orders(new Set(tmp.orders))

        return auction
    }
    
    export function auction_to_orders_list(manager: EntityManager, market: Auction): OrderItem[] {
        let tmp = []
        for (let index of market.orders) {
            let order = manager.get_item_order(index)
            tmp.push(order)
        }
        return tmp
    }

    export function auction_to_orders_json_list(manager: EntityManager, market: Auction): OrderItemJson[] {
                let tmp = []
        for (let index of market.orders) {
            let order = manager.get_item_order(index)
            tmp.push(AuctionOrderManagement.order_to_json(order))
        }
        return tmp
    }

    /**  Sends money to market and sets order as finished.  
    * Does NOT send item itself: use claim_item to recieve item from order.  
    * Does NOT send money to owner: use claim_money to recieve them from order.  
    * */
    export async function buyout(pool: any, manager: EntityManager, socket_manager: SocketManager, market: Auction, buyer: CharacterGenericPart, id: auction_order_id) {
        if (!market.orders.has(id)) {
            return AuctionResponce.NO_SUCH_ORDER
        }

        let order = manager.get_item_order(id)
        if (buyer.savings.get() < order.buyout_price) {
            return AuctionResponce.NOT_ENOUGH_MONEY
        }

        if (order.flags.finished) {
            return AuctionResponce.INVALID_ORDER
        }

        // order.return_money()
        order.flags.finished = true
        order.latest_bidder = buyer
        buyer.savings.transfer(market.savings, order.buyout_price)
        socket_manager.send_savings_update(buyer)

        AuctionOrderManagement.save_db(pool, order)
    }

    /**
     * Claims item from finished order.
     */
    export function claim_order_item(pool: any, manager: EntityManager, character:CharacterGenericPart, order_id: auction_order_id, market: Auction) {
        if (!market.orders.has(order_id)) {
            return AuctionResponce.NO_SUCH_ORDER
        }

        let order = manager.get_item_order(order_id)
        if (!order.flags.finished) {
            return AuctionResponce.INVALID_ORDER
        }

        
        if (character.id != order.latest_bidder.id) {
            return AuctionResponce.INVALID_ORDER
        }

        if (order.flags.item_sent) {
            return AuctionResponce.INVALID_ORDER
        }

        let item = order.item
        switch(item.item_type) {
            case 'armour': character.equip.add_armour(item as Armour);
            case 'weapon': character.equip.add_weapon(item as Weapon)
        }

        order.flags.item_sent = true
        AuctionOrderManagement.save_db(pool, order)
    }

    /**
     * Claims money from finished order.
     */
    export function claim_order_money(pool: any, manager: EntityManager, character:CharacterGenericPart, order_id: auction_order_id, market: Auction){
        if (!market.orders.has(order_id)) {
            return AuctionResponce.NO_SUCH_ORDER
        }

        let order = manager.get_item_order(order_id)
        if (!order.flags.finished) {
            return AuctionResponce.INVALID_ORDER
        }

        
        if (character.id != order.owner.id) {
            return AuctionResponce.INVALID_ORDER
        }

        if (order.flags.profit_sent) {
            return AuctionResponce.INVALID_ORDER
        }

        market.savings.transfer(character.savings, order.buyout_price)
        order.flags.profit_sent = true

        AuctionOrderManagement.save_db(pool, order)
    }

    async function update(pool: any, manager: EntityManager, socket_manager:SocketManager, market: Auction) {
        let now = Date.now();
        for (let i of market.orders) {
            let order = manager.get_item_order(i);
            let responce = await AuctionOrderManagement.check_order(pool, order)
            if (responce) {
                market.changed = true
            }   
        }
        if (market.changed) {
            AuctionManagement.save(pool, market)
            socket_manager.send_item_market_update(market)
            market.changed = false;
        }        
    }
}





// I will restore only minimal functionalty of auction: only buyouts, 
// i don't want to think too hard about returning money to bidders which moved away.
export class Auction {
    orders: Set<auction_order_id>
    changed: boolean
    cell_id: number
    savings: Savings
    id: auction_id

    constructor(id: auction_id, cell_id: number) {
        this.id = id
        this.orders = new Set();
        this.changed = false;
        this.cell_id = cell_id
        this.savings = new Savings()
    }

    add_order(order: OrderItem) {
        this.orders.add(order.id)
        this.changed = true
    }

    set_orders(orders: Set<auction_order_id>) {
        this.orders = orders
        this.changed = true
    }

    // async bid(pool, bidder, new_price, id) {
    //     if (!(id in this.orders)) {
    //         return
    //     }
    //     let order = this.world.get_item_order(id);
    //     if ((bidder.savings.get() < new_price) || (new_price <= order.current_price)) {
    //         return
    //     }
    //     if (bidder.id == order.owner_id) {
    //         return
    //     }
    //     await order.return_money()
    //     bidder.savings.inc(-new_price);
    //     await order.bid(pool, bidder, new_price);
    //     await order.save_to_db(pool);
    //     this.CHANGED = true;
    // }

    // async resolve(pool, i) {
    //     let order = this.world.get_item_order(i)
    //     let item = order.item
    //     let owner = order.owner;
    //     let winner = this.world.get_from_id_tag(this.latest_bidder, 'chara');
    //     if (winner == undefined) {
    //         if (owner != undefined) {
    //             owner.equip.add_item(item)
    //             owner.save_to_db(pool);
    //             return true
    //         }
    //         return true
    //     }
    //     winner.equip.add_item(item);
    //     if (owner != undefined) {
    //         winner.savings.transfer(owner.savings, this.current_price)
    //         winner.save_to_db(pool);
    //         owner.save_to_db(pool);
    //         return true
    //     }
    //     return true
    // }
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
    flags: OrderFlags
}

interface OrderFlags {
        finished: boolean,
        profit_sent: boolean,
        item_sent: boolean
    }

export class OrderItem {
    item: Weapon|Armour;
    owner: CharacterGenericPart;
    owner_id: number;
    buyout_price: money;
    current_price: money;
    latest_bidder: CharacterGenericPart;
    end_time: number;
    id: auction_order_id
    market_id: auction_id
    flags: OrderFlags

    constructor(item: Weapon|Armour, owner: CharacterGenericPart, latest_bidder:CharacterGenericPart, buyout_price: money, current_price: money, end_time: number, id: auction_order_id, market_id: auction_id, flags: OrderFlags) {
        this.item = item;
        this.owner = owner;
        this.owner_id = owner.id;
        this.buyout_price = buyout_price;
        this.current_price = current_price;
        this.latest_bidder = latest_bidder;
        this.end_time = end_time;
        this.id = id;
        this.market_id = market_id
        this.flags = flags
    }

    dead() {
        return (this.flags.finished && this.flags.item_sent && this.flags.profit_sent)
    }
}