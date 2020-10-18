SKILL_DESC = {
    'warrior_training': 'improve your physical conditions, at final level gives you a tactic slot 2',
    'mage_training': 'improve your magical power, at final level gives you a tactic slot 2',
    'charge': 'unlock charge ability: you are moved to your enemy position at cost of increasing rage',
    'rage_control': 'rage influence accuracy less',
    'cold_rage': 'rage influence accuracy even less',
    'the_way_of_rage': 'rage almost does not influence accuracy',
    'blocking_movements': 'you learn basics of blocking attacks, now you have better chances to block enemy attack',
    'blood_battery': 'blood now makes all magical damage higher',
    'first_steps_in_magic': 'unlock magic bolt: ranged ability with low blunt damage',
    'less_stress_from_crafting': 'at second level of this ability you can safely craft various things, third one decrease stress even more and unlock futher development of your crafting abilities',
    'less_stress_from_making_food': 'you gain less stress from preparing food',
    'disenchanting': 'unlock ability to break items into zaz',
    'less_stress_from_disenchant': 'you gain less stress from disenchanting',
    'sewing': 'unlock ability to sew clothes',
    'cook': 'unlock ability to prepare food',
    'enchanting':'unlock ability to use zaz to add enchantments to items',
    'less_stress_from_enchant': 'you gain less stress from enchanting',
}


function send_skill_up_message(socket, tag) {
    console.log(tag)
    socket.emit('up-skill', tag);
}

// eslint-disable-next-line no-unused-vars
class SkillTree {
    constructor(container, socket) {
        this.data = {};
        this.container = container;
        this.table = document.createElement('table');
        this.socket = socket;
        this.levels = null;
    }

    draw() {
        this.container.textContent = '';
        this.container.appendChild(this.table);
    }

    update(data = {}, levels = {}) {
        this.data = data;
        this.levels = levels;
        this.table = document.createElement('table');
        let header = this.table.insertRow();
        let skill = header.insertCell(0);
        let desc = header.insertCell(1);
        let button = header.insertCell(2);
        let skill_level = header.insertCell(3);
        skill.innerHTML = 'skill';
        desc.innerHTML = 'desc';
        button.innerHTML = 'button';
        skill_level.innerHTML = 'skill_level';
        for (let i in this.data) {
            let row = this.table.insertRow();
            let skill = this.data[i];
            let skill_cell = row.insertCell(0);
            skill_cell.innerHTML = skill.tag;
            let req_cell = row.insertCell(1);
            req_cell.innerHTML = 'required level ' + skill.req_level + ' ' + skill.req_skills + ' ';
            let tmp = row.insertCell(2)
            var tag = skill.tag;
            let button = document.createElement('button');
            button.innerHTML = '+';
            tmp.appendChild(button);
            ((tag) => 
                button.onclick = () => send_skill_up_message(this.socket, tag)
            )(tag)
            tmp = 0;
            if (skill.tag in levels) {
                tmp = levels[skill.tag];
            }
            let level_cell = row.insertCell(3);
            level_cell.innerHTML = tmp;
        }
        this.draw();
    }
}