
const EQUIPMENT_TAGS = ['right_hand'];

function send_update_request(socket) {
    socket.emit('char-info-detailed');
}

function send_equip_message(socket, index) {
    socket.emit('equip', index);
    socket.emit('char-info-detailed');
}

function send_eat_request(socket) {
    socket.emit('eat');
    socket.emit('char-info-detailed');
}

function send_clean_request(socket) {
    socket.emit('clean');
    socket.emit('char-info-detailed');
}

class CharacterScreen {
    constructor(div, socket) {
        this.data = {}
        this.socket = socket;
        this.div = div;

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_update_request(this.socket)
        )();
        this.button.innerHTML = 'update';
        this.div.appendChild(this.button);

        this.table = document.createElement('table');
        this.table2 = document.createElement('table');
        this.misc = document.createElement('misc');

        this.div.appendChild(this.table);

        let label1 = document.createElement('p');
        label1.innerHTML = 'Equipment:';
        this.div.appendChild(label1);
        this.div.appendChild(this.table2);
        this.div.appendChild(this.misc);

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_eat_request(this.socket)
        )();
        this.button.innerHTML = 'eat';
        this.div.appendChild(this.button);

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => send_clean_request(this.socket)
        )();
        this.button.innerHTML = 'clean';
        this.div.appendChild(this.button);

        console.log('character_screen_loaded')
    }

    update(data) {
        console.log(data)
        let inv = data.equip.backpack;
        this.table.innerHTML = '';
        this.table2.innerHTML = ''
        for (let i = 0; i < inv.length; i++) {
            if (inv[i] != null) {
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
                let a = row.insertCell(j + 2);
                if (affix != undefined){
                    a.innerHTML = affix.tag + ' ' + affix.tier;
                }
            }
        }

        this.misc.innerHTML = '';
        for (let i in data.stats) {
            let stats_line = document.createElement('p');
            stats_line.append(document.createTextNode(`${i}: ${data.stats[i]}`));
            this.misc.appendChild(stats_line);
        }

        for (let i in data.stash.data) {
            let other_line = document.createElement('p');
            other_line.append(document.createTextNode(`${i}: ${data.stash.data[i]}`))
            this.misc.appendChild(other_line);
        }
    }
}