import { dom } from "./dom.js";
import {hamburger_menu, animation} from "./hamburger_menu.js";

// This function is to initialize the application
function init() {
    dom.init();
    dom.loadBoards();
    dom.switch();
    dom.addNewBoard();
    hamburger_menu();
    animation();
    dom.registration();
    dom.login();
}

window.onload = function() {
    init();
}
