import { Socket } from "../../../shared/battle_data";

// eslint-disable-next-line no-undef
declare const io: any;
export var socket: Socket = io();
