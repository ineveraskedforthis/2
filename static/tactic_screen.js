function send_tactic(socket, tactic) {
    console.log(tactic);
    socket.emit('set-tactic', tactic);
}

// eslint-disable-next-line no-unused-vars
class TacticScreen {
    constructor(container, socket) {
        this.data = {};
        this.select_trigger_target = [];
        this.select_trigger_value_tag = [];
        this.select_trigger_sign = [];
        this.input_trigger_value = [];
        this.select_action_target = [];
        this.select_action_action = [];
        this.tactic_block = [];
        this.container = container;
        this.socket = socket;
        this.list_length = 10
        var tmp_form = document.createElement('form');   
        let save_button = document.createElement('button');     
        save_button.value = 'save';
        save_button.innerHTML = 'save';
        ((socket) => 
            save_button.onclick = () => {
                send_tactic(socket, this.get_tactic()); return false
            }
        )(this.socket);
        this.container.appendChild(save_button);
        let reset_button = document.createElement('button'); 
        reset_button.value = 'reset';
        reset_button.innerHTML = 'reset';
        reset_button.onclick = () => {this.reset_tactic(); return false}
        this.container.appendChild(reset_button);
        for (let i = 0; i < this.list_length; i++) {
            this.tactic_block.push(document.createElement('tr'));

            let trigger_row = document.createElement('tr');

            let select_trigger_target = document.createElement('select');
            select_trigger_target.id = `${i}-trigger-target`;
            this.select_trigger_target.push(select_trigger_target);

            let select_trigger_value_tag = document.createElement('select');
            select_trigger_value_tag.id = `${i}-trigger-value-tag`;
            this.select_trigger_value_tag.push(select_trigger_value_tag);

            let select_trigger_sign = document.createElement('select');
            select_trigger_sign.id = `${i}-trigger-value-sign`;
            this.select_trigger_sign.push(select_trigger_sign);

            let select_trigger_value = document.createElement('input');
            select_trigger_value.id = `${i}-trigger-value`;
            this.input_trigger_value.push(select_trigger_value);

            let trigger_row_2 = document.createElement('td');
            trigger_row_2.appendChild(this.select_trigger_target[i]);
            trigger_row_2.appendChild(this.select_trigger_value_tag[i]);
            trigger_row_2.appendChild(this.select_trigger_sign[i]);
            trigger_row_2.appendChild(this.input_trigger_value[i]);

            let trigger_label = document.createElement('td');
            trigger_label.innerHTML = 'trigger';
            trigger_row.appendChild(trigger_label);

            trigger_row.appendChild(trigger_row_2);
            
            let action_row = document.createElement('tr');

            let select_action_target = document.createElement('select');
            select_action_target.id = `${i}-action-target`;
            this.select_action_target.push(select_action_target);

            let select_action_action = document.createElement('select');
            select_action_action.id = `${i}-action-action`;
            this.select_action_action.push(select_action_action);

            let action_row_2 = document.createElement('td');
            action_row_2.appendChild(this.select_action_target[i]);
            action_row_2.appendChild(this.select_action_action[i]);

            let action_label = document.createElement('td');
            action_label.innerHTML = "action"
            action_row.appendChild(action_label);
            action_row.appendChild(action_row_2);
            
            let index = document.createElement('td')
            index.innerHTML = i
            this.tactic_block[i].appendChild(index)

            var tmp = document.createElement('td');
            tmp.appendChild(trigger_row);
            tmp.appendChild(action_row);
            this.tactic_block[i].appendChild(trigger_row);
            this.tactic_block[i].appendChild(action_row);
            tmp_form.appendChild(this.tactic_block[i]);
        }
        this.container.appendChild(tmp_form);
    }
    
    update(data) {
        this.data = data;
    }
    
    get_tactic() {
        var tactic = {};
        for (var i = 0; i < this.list_length; i++) {
            tactic['s' + i] = {
                trigger: {
                    target: this.select_trigger_target[i].value,
                    tag: this.select_trigger_value_tag[i].value,
                    sign: this.select_trigger_sign[i].value,
                    value: parseInt(this.input_trigger_value[i].value),
                },
                action: {
                    target: this.select_action_target[i].value,
                    action: this.select_action_action[i].value,
                }
            }
            // var trigger = tactic['s' + i].trigger;
            // var action = tactic['s' + i].action;
            // if (undefined in [trigger.target, trigger.tag, trigget.sign, trigger.value, action.target, action.action]) {
                // tactic['s' + i] = undefined;
            // }
        }
        return tactic;
    }
    
    reset_tactic() {
        var counter = 0;
        console.log(this.data);
        for (var i in this.data) {
            var slot = this.data[i]
            if (slot != null) {
                document.getElementById(`${counter}-trigger-target`).value = slot.trigger.target;
                document.getElementById(`${counter}-trigger-value-tag`).value = slot.trigger.tag;
                document.getElementById(`${counter}-trigger-value-sign`).value = slot.trigger.sign;
                document.getElementById(`${counter}-trigger-value`).value = slot.trigger.value;
                document.getElementById(`${counter}-action-target`).value = slot.action.target;
                document.getElementById(`${counter}-action-action`).value = slot.action.action;
                this.tactic_block[counter].style.display = 'block'
            }
            else {
                this.tactic_block[counter].style.display = 'none';
            }
            counter += 1;
        }
        for (counter; counter < this.list_length; counter++) {
            this.tactic_block[counter].style.display = 'none';
        }
    }

    add_action(action) {
        let j = this.select_action_action[0].length;
        for (let i = 0; i < this.list_length; i++){
            this.select_action_action[i][j] = new Option(action, action)
        }
    }
    
    update_tags(tags) {
        // console.log(tags);
        let j = 0;
        for (let target_tag of tags.target) {
            for (let i = 0; i < this.list_length; i++) {
                this.select_trigger_target[i][j] = new Option(target_tag, target_tag);
                this.select_action_target[i][j] = new Option(target_tag, target_tag);
            }
            j += 1;
        }
        j = 0;
        for (let value_tag of tags.value_tags) {
            for (let i = 0; i < this.list_length; i++) {
                this.select_trigger_value_tag[i][j] = new Option(value_tag, value_tag);
            }
            j += 1;
        }
        j = 0;
        for (let sign of tags.signs) {
            for (let i = 0; i < this.list_length; i++) {
                this.select_trigger_sign[i][j] = new Option(sign, sign);
            }
            j += 1;
        }
        j = 0;
        for (let action of tags.actions) {
            for (let i = 0; i < this.list_length; i++){
                this.select_action_action[i][j] = new Option(action, action)
            }
            j += 1;
        }
    }
}