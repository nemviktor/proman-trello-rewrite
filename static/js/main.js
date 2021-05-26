import { dom } from "./dom.js";
import {animation} from "./hamburger_menu.js";

// This function is to initialize the application
function init() {
    dom.init();
    dom.loadBoards();
    dom.switch();
    dom.addNewBoard();
    animation();
}

window.onload = function() {
    init();
}
