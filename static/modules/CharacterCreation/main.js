import { elementById, inputById, selectById } from "../HTMLwrappers/common.js";
var character_display = {
    eyes: 1,
    chin: 0,
    mouth: 0
};
export function set_up_character_creation_UI(socket) {
    elementById("next_2").onclick = (event) => {
        event.preventDefault();
        let name = inputById('char_name').value;
        let race = selectById('char_race').value;
        let data = {
            name: name,
            mouth: character_display.mouth,
            chin: character_display.chin,
            eyes: character_display.eyes,
            faction: race,
            race: race
        };
        console.log(data);
        socket.emit('create_character', data);
    };
    selectById('char_race').addEventListener('change', function () {
        let faction = selectById('char_race').value;
        set_faction(faction);
    });
    const minimap = elementById('minimap_character_creation');
    const width = minimap.clientWidth;
    const height = minimap.clientHeight;
    minimap.onclick = (event) => {
        const x_position = event.offsetX;
        const y_position = event.offsetY;
        if ((y_position > height / 2) && (x_position < width / 3)) {
            set_faction('city');
        }
        else if ((y_position > height / 2) && (x_position > width / 2)) {
            set_faction('big_humans');
        }
        else if ((y_position > height / 2) && (x_position < width / 1.5)) {
            set_faction('rats');
        }
        else if ((y_position < height / 3) && (x_position > width / 2)) {
            set_faction('elodino_free');
        }
        else if ((y_position < 2 * height / 3) && (x_position > width / 3)) {
            set_faction('graci');
        }
        else if ((y_position < height / 2) && (x_position < width / 3)) {
            set_faction('steppe_humans');
        }
    };
    minimap.onmousemove = (event) => {
        const x_position = event.offsetX;
        const y_position = event.offsetY;
        if ((y_position > height / 2) && (x_position < width / 3)) {
            hover_faction('city');
        }
        else if ((y_position > height / 2) && (x_position > width / 2)) {
            hover_faction('big_humans');
        }
        else if ((y_position > height / 2) && (x_position < width / 1.5)) {
            hover_faction('rats');
        }
        else if ((y_position < height / 3) && (x_position > width / 2)) {
            hover_faction('elodino_free');
        }
        else if ((y_position < 2 * height / 3) && (x_position > width / 3)) {
            hover_faction('graci');
        }
        else if ((y_position < height / 2) && (x_position < width / 3)) {
            hover_faction('steppe_humans');
        }
    };
}
function set_faction(faction) {
    selectById('char_race').value = faction;
    var race = "unknown";
    if (faction == 'city')
        race = 'human';
    if (faction == 'steppe_humans')
        race = 'human';
    if (faction == 'big_humans')
        race = 'human_strong';
    if (faction == 'rats')
        race = 'bigrat';
    if (faction == 'graci')
        race = 'graci';
    if (faction == 'elodino_free')
        race = 'elo';
    hover_faction(faction);
}
function hover_faction(faction) {
    elementById('minimap_overlay').style.backgroundImage = 'url(/static/img/minimap/' + faction + '.png)';
}
