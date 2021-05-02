// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards){
            dom.showBoards(boards);
            //Rename boards
            dataHandler.renameBoard();
            dom.toggleBoard();
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also

        let boardList = '';

        for(let board of boards){
            boardList += `
                <section class="board" id="${board.id}">
                    <div class="board-header">
                        <span class="board-title">${board.title}
                        </span> 
                        <button class="board-add">Add Card</button>
                        <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="board-columns">
                        <div class="board-column">
                             <div class="board-column-title">New</div>
                             <div class="board-column-content new"></div>
                         </div>
                         <div class="board-column">
                             <div class="board-column-title">In progress</div>
                             <div class="board-column-content in_progress"></div>
                         </div>
                         <div class="board-column">
                             <div class="board-column-title">Testing</div>
                             <div class="board-column-content testing"></div>
                         </div>
                         <div class="board-column">
                             <div class="board-column-title">Done</div>
                             <div class="board-column-content done"></div>
                         </div>                
                    </div>
                </section>
            `;
            this.loadCards(board.id);
        }

        const outerHtml = `
            <div class="board-container">
                ${boardList}
            </div>
        `;

        let boardsContainer = document.querySelector('#boards');
        boardsContainer.insertAdjacentHTML("beforeend", outerHtml);
    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
        dataHandler.getCardsByBoardId(boardId, function(cards) {
            dom.showCards(cards, boardId);
            })
    },
    showCards: function (cards, boardId) {
        // shows the cards of a board
        // it adds necessary event listeners also
        let cardList = '';

        for(let card of cards) {
            cardList = `<div class="card">
                            <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                            <div class="card-title">${card.title}</div>
                         </div>`

            let statuses = ['new', 'in_progress', 'testing', 'done'];
            for (let status_ of statuses) {
                let cardContainer = document.querySelectorAll(`.board-column-content.${status_}`);
                if (card.board_id === boardId && card.status_id === status_ ) {
                    cardContainer[(card.board_id)-1].insertAdjacentHTML("beforeend", cardList);
                }
            }
        }

    },
    toggleBoard: function(){
        let board_toggles = document.querySelectorAll('.button-toggle');
        for (let board_toggle of board_toggles) {
            board_toggle.addEventListener('click', function(event) {
                event.target.parentElement.nextElementSibling;
                console.log(event.target.parentElement.nextElementSibling);
            })
        }

    }
    // here comes more features
};
