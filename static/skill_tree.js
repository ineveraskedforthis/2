


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
            skill_cell.innerHTML = '<div class = "tooltip"><span class="tooltiptext">'+ SKILL_DESC[skill.tag] + '</span>' + skill.tag + '</div>';
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