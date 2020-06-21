class AuctionHouse{
    constructor(){
        this.data = [];
    }
    update(data = []){
        //console.log(data);
        document.getElementById('auction_buy_tab').innerHTML = ""; 
        data.forEach(element => {
            if (element.typ == 'SELL')
            document.getElementById('auction_buy_tab').innerHTML += `<div class=auc_slot>${element.tag}</div>`; 
        });
        
    }
}

