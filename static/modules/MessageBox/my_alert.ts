import { elementById } from "../HTMLwrappers/common.js";

var current_alerts = 0

function generate_alert_box(message: string, classes: string[]) {
    current_alerts++;

    const box = document.createElement("div")
    box.innerHTML = message
    elementById("notification_area").appendChild(box)
    box.classList.add(... ["notification"], ... classes)

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
        setTimeout(() => generate_alert_box(msg, ["white-bg"]), current_alerts * 1000);
    }
}

interface Notification {
    response: "Notification:"
    value: string
    tag: "condition_failed"|"success"|"information"
}

export function notification(data: Notification) {
    let classes = []
    switch(data.tag) {
        case "condition_failed":classes.push("red-bg");break;
        case "success":classes.push("green-bg");break;
        case "information":classes.push("white-bg");break;
    }
    setTimeout(() => generate_alert_box(data.value, classes), current_alerts * 1000);
}
