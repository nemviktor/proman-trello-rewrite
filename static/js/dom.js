import {dataHandler} from "./data_handler.js";

export let dom = {
    init: function () {
    },
    loadBoards: function () {
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards, dom.loadStatuses);
        });
    },
    showBoards: function (boards, callback) {
        let id = ""
        for (let board of boards) {
            id = board.id
            dom.createBoard(board)
            callback(id);
        }
        dom.toggleButton();
    },
    createBoard(board){
         const outerHtml = `
            <section class="board">
                <div class="board-header" id="${board.id}"><span class="board-title" id="title${board.id}">${board.title}</span>
                    <button class="board-add" data-board-id="${board.id}">Add Card</button>
                    <button class="board-toggle" id="${board.id}"><i class="fas fa-chevron-down"></i></button>
            </div>
            <div class="board-columns"  data-id="${board.id}"</div>
            </section>`;
        let boardsContainer = document.querySelector('.board-container');
        boardsContainer.insertAdjacentHTML("beforeend", outerHtml);
    },
    loadStatuses: function (boardId) {
        dataHandler.getStatuses(boardId,function (statuses) {
            dom.showStatuses(statuses, boardId, dom.loadCards);
        });
    },
    showStatuses: function (statuses,boardId, callback) {
        for (let status of statuses) {
           dom.createStatus(status, boardId);
        }
        callback(boardId);
    },
    createStatus(status, boardId){
         const outerHtml = `
            <div class="board-column">
                <div class="board-column-title" id="status-${status.id}">${status.title}</div>
                <div class="board-column-content" data-status-id="${status.id}" data-status="${status.title}" boardId = ${boardId}  id="${status.id}">
            </div>
             `;
            let statusContainerBoard = document.querySelector("[data-id=" + CSS.escape(status.board_id) + "]");
            if (statusContainerBoard !== null) {
                statusContainerBoard.insertAdjacentHTML("beforeend", outerHtml);
            }
    },
    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId,function (cards) {
            dom.showCards(cards)
        })
    },
    showCards: function (cards, callback) {
        for (let card of cards) {
            dom.createCard(card);
        }
    },
    createCard(card){
        const outerHtml = `
                <div class="card" id="${card.id}" data_status=${card.status_id}>
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title" id="card-${card.id}">${card.title}</div>
               </div>`;
            let cardContainers = document.querySelectorAll('.board-column-content');
            for(let statusColumn of cardContainers){
                console.log('statusAttributeforContainer',statusColumn.getAttribute('data-status-id'))
                console.log('CardStatus',card.status_id)
                console.log('statusColumn boardId',  statusColumn.getAttribute('boardId'))
                console.log('card-board_id', card.board_id)
                if (statusColumn.getAttribute('data-status-id') == card.status_id &&
                     statusColumn.getAttribute('boardId') == card.board_id) {
                    statusColumn.insertAdjacentHTML("beforeend", outerHtml);
                }
            }
            // let cardContainer = document.querySelector("[data-status-id=" + CSS.escape(card.status_id) + "]");
    },
    toggleButton: function () {
        let boards = document.querySelectorAll(".board-toggle");
        for (let board of boards) {
            board.addEventListener('click', function (event) {
                let boardSection = board.parentNode.parentNode
                boardSection.children[1].classList.toggle('hide');

            })
        }

    }

};
