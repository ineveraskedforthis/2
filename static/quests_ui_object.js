// QUESTS
let quests_ui_object = {};
quests_ui_object.selected_quest_giver = undefined;
quests_ui_object.quest_givers = {};
function quests_reset() {
    let qg = document.querySelector('.quest_list');
    qg.innerHTML = "";

    let q = document.querySelector('.quest_block');
    q.innerHTML = "";
}
function update_quest_giver(quest_giver) {
    quests_ui_object.quest_givers[quest_giver.tag] = quest_giver.quests;
    let tag = quest_giver.tag;
    {
        let div = document.createElement('div');
        div.id = tag + '_questgiver';
        div.classList.add('quest_giver_block');

        let por_div = document.createElement('div');
        por_div.classList.add('portrait');
        por_div.style.backgroundImage = 'url(/static/img/portrait_' + tag + '.png)';
        div.appendChild(por_div);

        let name_div = document.createElement('div');
        name_div.classList.add('name');
        name_div.innerHTML = quest_giver.name;
        div.appendChild(name_div);

        ((div, tag) => {
            div.onclick = () => {
                let prev = document.querySelector('.quest_givers > .selected');
                if (prev != null)
                    prev.classList.remove('selected');

                div.classList.add('selected');
                quests_ui_object.selected_quest_giver = div.id;
                document.querySelector('.quest_portrait').style.backgroundImage = 'url(/static/img/portrait_' + tag + '.png)';
            };
        })(div, tag);

        let list = document.querySelector('.quest_givers');
        list.appendChild(div);
    }

    for (let quest of quest_giver.quests) {
        let qtag = quest.tag;
        let div = document.createElement('div');
        div.id = qtag + '_quest_' + tag;
        div.classList.add('quest_block');

        let d_short = document.createElement('div');
        d_short.classList.add('d_short');
        d_short.innerHTML = quest.name;
        ((tab) => tab.onclick = () => {
            tab.parentElement.querySelector('.d_expand').classList.toggle('hidden');
        })(d_short);
        div.appendChild(d_short);

        let d_expand = document.createElement('div');
        d_expand.classList.add('d_expand');
        d_expand.classList.add('hidden');
        div.appendChild(d_expand);

        let description = document.createElement('div');
        description.innerHTML = quest.description;

        let button = document.createElement('div');
        button.classList.add("button");
        button.innerHTML = 'Get reward';

        d_expand.appendChild(description);
        d_expand.appendChild(button);

        let list = document.querySelector('.quest_list');
        list.appendChild(div);
    }

}
update_quest_giver({ tag: 'ith_merchant_mayor', name: 'G\'Ith\'Ub', quests: [{ tag: 'kill', name: 'kill yourself', description: 'please' }] });
