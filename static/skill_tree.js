class SkillTree {
    constructor(container, socket) {
        this.data = {};
        this.container = container;
        this.table = document.createElement('table');
        this.socket = socket;
        this.levels = null;
    }

    draw() {
        this.container.empty();
        this.container.append(this.table);
    }

    update(data = {}, levels = {}) {
        this.data = data;
        this.levels = levels;
        this.table = document.createElement('table');
        let header = this.table.insertRow();
        let skill = header.insertCell(0);
        let desc = header.insertCell(0);
        let button = header.insertCell(0);
        let skill_level = header.insertCell(0);
        skill.innerHTML = 'skill';
        desc.innerHTML = 'desc';
        button.innerHTML = 'button';
        skill_level.innerHTML = 'skill_level';
        for (var i in this.data) {
            var row = $('<tr>');
            var skill = this.data[i];
            row.append($('<td>').text(skill.tag));
            row.append($('<td>').text('required level ' + skill.req_level));
            var tmp = $('<td>');
            var tag = skill.tag;
            ((tag) => tmp.append($('<button/>')
                .text('+')
                .click(() => send_skill_up_message(this.socket, tag))
            ))(tag)
            row.append(tmp);
            tmp = 0;
            if (skill.tag in levels) {
                tmp = levels[skill.tag];
            }
            row.append($('<td>').text(tmp));
            this.table.append(row);
        }
        this.draw();
    }

    populate_row(row, l) {
        for (var i of l) {
            row.append($('<td>').text(i));
        }
        return row;
    }
}