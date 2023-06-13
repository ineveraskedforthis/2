import { socket, globals } from './modules/globals.js';
import { SKILL_NAMES } from './SKILL_NAMES.js';
// tmp.typ = this.typ;
// tmp.tag = this.tag;
// tmp.owner_id = this.owner_id;
// if (this.owner != undefined) {
//     tmp.owner_name = this.owner.name;
//     tmp.owner_tag = this.owner.get_tag;
// }
// tmp.amount = this.amount;
// tmp.price = this.price;
// tmp.id = this.id;
// perks related
function request_perks() {
    socket.emit('request-talk', globals.selected_character);
}
{
    let button = document.getElementById('request_perks_selected_charater');
    button.onclick = request_perks;
}
{
    let button = document.getElementById('close_perks');
    button.onclick = () => close_perks();
}
function close_perks() {
    let big_div = document.getElementById('available_perks');
    big_div.classList.add('hidden');
}
function send_perk_learning_request(i) {
    return () => socket.emit('learn-perk', { tag: i, id: globals.selected_character });
}
function send_skill_learning_request(i) {
    return () => socket.emit('learn-skill', { tag: i, id: globals.selected_character });
}
function buy_land_plot_request() {
    return () => socket.emit('buy-plot', { id: globals.selected_character });
}
function epitet(number) {
    if (number >= 90) {
        return 'master';
    }
    if (number >= 70) {
        return 'expert';
    }
    if (number >= 50) {
        return 'competent';
    }
    if (number >= 30) {
        return 'mediocre';
    }
}
function build_perks_list(data) {
    console.log('build perks');
    console.log(data);
    let big_div = document.getElementById('available_perks');
    let greeting_line = `Hello, I am ${data.name} of ${data.race} race. `;
    let flag = true;
    for (let faction_block of data.factions) {
        if (faction_block.reputation != 'neutral') {
            flag = false;
            greeting_line += `I am ${faction_block.reputation} of ${faction_block.name}. `;
        }
    }
    if (flag) {
        greeting_line += ('I am not related to any local faction. ');
    }
    if (Object.keys(data.skills).length == 0) {
        greeting_line += ('I have no particular skills. ');
    }
    else {
        for (let skill of Object.keys(data.skills)) {
            let temp = data.skills[skill];
            if (temp == undefined)
                continue;
            let [level, price] = temp;
            greeting_line += `I am ${epitet(level)} at ${SKILL_NAMES[skill]}. `;
        }
        greeting_line += `I can teach you for a price. `;
    }
    document.getElementById('character_greeting').innerHTML = greeting_line;
    let perks_div = document.getElementById('perks_for_learning');
    perks_div.innerHTML = '';
    for (let [i, value] of Object.entries(data.perks)) {
        let list_entry = document.createElement('div');
        let label = document.createElement('div');
        label.innerHTML = i;
        let button = document.createElement('button');
        button.onclick = send_perk_learning_request(i);
        button.innerHTML = 'learn (' + value + ')';
        label.classList.add('flex-3');
        button.classList.add('flex-1');
        list_entry.appendChild(label);
        list_entry.appendChild(button);
        list_entry.classList.add('container-horizontal');
        list_entry.classList.add('height-50');
        perks_div.appendChild(list_entry);
    }
    let buy_plot_button = document.getElementById('buy_land_plot');
    buy_plot_button.onclick = buy_land_plot_request();
    let skills_div = document.getElementById('skills_for_learning');
    skills_div.innerHTML = '';
    for (let skill of Object.keys(data.skills)) {
        let tmp = data.skills[skill];
        if (tmp == undefined)
            continue;
        let [level, price] = tmp;
        let list_entry = document.createElement('div');
        let label = document.createElement('div');
        let button = document.createElement('button');
        label.innerHTML = SKILL_NAMES[skill];
        button.innerHTML = `learn (${price})`;
        label.classList.add('flex-3');
        button.classList.add('flex-1');
        button.onclick = send_skill_learning_request(skill);
        list_entry.append(label);
        list_entry.append(button);
        list_entry.classList.add('container-horizontal');
        list_entry.classList.add('height-50');
        skills_div.appendChild(list_entry);
    }
    big_div.classList.remove('hidden');
}
function update_perks(data) {
    console.log('PERKS!!!!');
    console.log(data);
    let div2 = document.getElementById('perks_tab');
    div2.innerHTML = '';
    for (let tag of Object.keys(data)) {
        console.log(tag);
        let div = document.createElement('div');
        div.innerHTML = tag;
        div2.append(div);
    }
}
function flex_something(s, w) {
    const item = document.createElement('div');
    item.classList.add('container-horizontal');
    const label = document.createElement('div');
    label.classList.add('flex-2');
    label.innerHTML = s;
    const data = document.createElement('div');
    data.classList.add('flex-1');
    data.innerHTML = w;
    item.appendChild(label);
    item.appendChild(data);
    return item;
}
function update_stats(data) {
    const stats_tab = document.getElementById('stats_tab');
    stats_tab.innerHTML = '';
    stats_tab.appendChild(flex_something(`Physical power: `, `${data.phys_power}`));
    stats_tab.appendChild(flex_something(`Magic power: `, `${data.magic_power}`));
    stats_tab.appendChild(flex_something(`Enchant rating: `, `${data.enchant_rating.toFixed(2)}`));
    stats_tab.appendChild(flex_something(`Cost of battle movement: `, `${data.movement_cost.toFixed(2)}`));
    stats_tab.appendChild(flex_something(`Movement duration: `, `${data.move_duration_map.toFixed(2)}`));
    stats_tab.appendChild(flex_something(`Magic bolt base damage `, `${data.base_damage_magic_bolt.toFixed(2)}`));
}
socket.on('perks-info', build_perks_list);
socket.on('perks-update', update_perks);
socket.on('stats', update_stats);
