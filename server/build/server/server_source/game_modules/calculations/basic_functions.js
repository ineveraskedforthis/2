"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trim = void 0;
function trim(value, left, right) {
    return Math.max(Math.min(value, right), left);
}
exports.trim = trim;
