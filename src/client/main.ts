import io from "socket.io-client";
import { default as initGame } from "./game.js";
import { default as initHome } from "./home.js";
import "./styles.css";
import "./default-styles.css";

export const socket = io();
initHome();
initGame();
