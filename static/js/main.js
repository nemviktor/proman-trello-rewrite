import { dom } from "./dom.js";
import {dataHandler} from "./data_handler.js";

// This function is to initialize the application
function init() {
    // init data
    dom.init();
    //creates new board
    // dataHandler.init();
    // loads the boards to the screen
    dom.loadBoards();
    dom.create_new_board();
}

init();
