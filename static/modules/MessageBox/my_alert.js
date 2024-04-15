import { elementById } from "../HTMLwrappers/common.js";
function generate_alert_box(message) {
    const box = document.createElement("div");
    box.innerHTML = message;
    elementById("notification_area").appendChild(box);
    box.classList.add(...["notification"]);
    box.addEventListener("animationend", box_remover(box), false);
}
function box_remover(box) {
    return function listener(event) {
        if (event.type == "animationend") {
            elementById("notification_area").removeChild(box);
        }
    };
}
export function my_alert(msg) {
    if (msg != 'ok') {
        generate_alert_box(msg);
    }
}
