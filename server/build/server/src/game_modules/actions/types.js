"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResponse = exports.ResponseOK = void 0;
exports.ResponseOK = {
    response: "OK"
};
var NotificationResponse;
(function (NotificationResponse) {
    NotificationResponse.InBattle = {
        response: "Notification:",
        value: "You are in battle."
    };
})(NotificationResponse || (exports.NotificationResponse = NotificationResponse = {}));
