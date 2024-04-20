import { elementById } from "../HTMLwrappers/common.js";

var current_alerts = 0

function generate_alert_box(message: string) {
    current_alerts++;

    const box = document.createElement("div")
    box.innerHTML = message
    elementById("notification_area").appendChild(box)
    box.classList.add(... ["notification"])

    box.addEventListener("animationend", box_remover(box), false);
}

function box_remover(box: HTMLElement) {
    return function listener(event: Event) {
        if (event.type == "animationend") {
            current_alerts--;
            elementById("notification_area").removeChild(box)
        }
    }
}

export function my_alert(msg: string) {
    if (msg != 'ok') {
        setTimeout(() => generate_alert_box(msg), current_alerts * 1000);
    }
}
