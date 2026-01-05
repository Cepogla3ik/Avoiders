import io from "socket.io-client";
import { default as initGame } from "./game";
import { default as initHome } from "./home";
import "./styles.css";
import "./default-styles.css";

export const socket = io();
initHome();
initGame();
