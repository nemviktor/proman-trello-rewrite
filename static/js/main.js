import { dom } from "./dom.js";
import {hamburger_menu} from "./hamburger_menu.js";

// This function is to initialize the application
function init() {
    // init data
    dom.init();
    // loads the boards to the screen
    dom.loadBoards();
    dom.create_new_board();
    dom.switch();
    dom.add_new_board();
    hamburger_menu();
}

window.onload = function() {
    init();
}
