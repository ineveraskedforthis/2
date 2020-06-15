
const EQUIPMENT_TAGS = ['right_hand'];

function send_update_request(socket) {
    socket.emit('char-info-detailed');
}

function send_equip_message(socket, index) {
    socket.emit('equip', index);
}

class CharacterScreen {
    constructor(div, socket) {
        this.data = {}
        this.socket = socket;
        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_update_request(this.socket)
        )();
        this.button.innerHTML = 'update';
        this.table = document.createElement('table');
        this.table2 = document.createElement('table');
        this.div = div
        this.div.appendChild(this.button)
        this.div.appendChild(this.table)
        let label1 = document.createElement('p')
        label1.innerHTML = 'Equipment:'
        this.div.appendChild(label1);
        this.div.appendChild(this.table2)
        console.log('character_screen_loaded')
    }

    update(data) {
        console.log(data)
        let inv = data.equip.backpack;
        this.table.innerHTML = ''
        for (let i = 0; i < inv.length; i++) {
            let row = this.table.insertRow();
            let type = row.insertCell(0);
            type.innerHTML = inv[i].tag
            for (let j = 0; j < inv[i].affixes; j++){
                let affix = inv[i]['a' + j];
                let a = row.insertCell(j + 1);
                if (affix != undefined){
                    a.innerHTML = affix.tag + ' ' + affix.tier;
                }
            }
            for (let j = inv[i].affixes + 1; j < 8; j++) {
                row.insertCell(j)
            }
            let button = document.createElement('button');
            button.innerHTML = 'equip';
            let tmp = row.insertCell(8)
            tmp.appendChild(button);
            ((index) => 
                button.onclick = () => send_equip_message(this.socket, index)
            )(i)
        }        
        for (let i = 0; i < EQUIPMENT_TAGS.length; i++) {
            let row = this.table2.insertRow();
            let slot = row.insertCell(0);
            slot.innerHTML = EQUIPMENT_TAGS[i]
            let item = data.equip[EQUIPMENT_TAGS[i]]
            let type = row.insertCell(1);
            type.innerHTML = item.tag
            for (let j = 0; j < item.affixes; j++){
                let affix = item['a' + j];
                let a = row.insertCell(j + 1);
                if (affix != undefined){
                    a.innerHTML = affix.tag + ' ' + affix.tier;
                }
            }
        }

    }
}