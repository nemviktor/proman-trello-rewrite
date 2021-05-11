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
    createBoard: function (board){
         const outerHtml = `
            <section class="board" id="board-${board.id}">
                <div class="board-header" id="${board.id}">
                    <span class="board-title" id="title${board.id}">${board.title}</span>
                    <form class="board-form hide" id="${board.id}">
                        <input type="text" class="new-name">
                        <button type="submit" class="save">Save</button>
                    </form>
                    <button class="board-remove" delete-board-id="${board.id}"><i class="fas fa-trash-alt"></i></button>
                    <button class="board-add" data-board-id="${board.id}">Add Card</button>
                    <button class="board-status-add" add-status-board-id="${board.id}"><i class="icon-columns"></i></button>
                    <button class="board-toggle" id="${board.id}"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="board-columns"  data-id="${board.id}">
                </div>
            </section>`;
        let boardsContainer = document.querySelector('.board-container');
        boardsContainer.insertAdjacentHTML("beforeend", outerHtml);

        //Putting event listener to the brand new board title
        let title_to_enable_rename = document.querySelector(`#title${board.id}`);
        title_to_enable_rename.addEventListener('click', dom.renameBoard);

        //Putting event listener to the add-board-column button
        let add_status_column = document.querySelector(`[add-status-board-id='${board.id}']`);
        add_status_column.addEventListener('click', ()=> {
            dom.addNewColumn((board.id));
        });
        //Putting event listener to the delete-board button
        let deleteBoardButton = document.querySelector(`[delete-board-id='${board.id}']`);
        deleteBoardButton.addEventListener('click', () => dom.deleteBoard(board.id))


    },
    loadStatuses: function (boardId) {
        dataHandler.getStatuses(boardId,function (boardId, statuses) {
            dom.showStatuses(boardId, statuses, dom.loadCards);
        });
    },
    showStatuses: function (boardId, statuses, callback) {
        let statusContainerAreas = document.querySelectorAll('.board-columns');
        if (statusContainerAreas !== null) {
            statusContainerAreas[boardId-1].innerHTML = '';
        }
        for (let status of statuses) {
            dom.createStatus(status, boardId);
        }
        callback(boardId);
    },
    createStatus(status, boardId){
         const outerHtml = `
            <div class="board-column" order="${status.order_id}">
                <div class="board-column-title" id="status-${status.id}">${status.title}</div>
                <form class="hide" id="${status.id}">
                    <input type="text" class="new-name">
                </form>
                <div class="board-column-content" data-status-id="${status.id}" data-status="${status.title}" data-order="${status.order_id}" boardid=${boardId}  id="${status.id}">
            </div>
             `;
            let statusContainerAreas = document.querySelectorAll('.board-columns');
            if (statusContainerAreas !== null) {
                statusContainerAreas[boardId-1].insertAdjacentHTML("beforeend", outerHtml);
            }
            let status_rename = document.querySelector(`#status-${status.id}`);
            // let form = status_rename.children[0];

            status_rename.addEventListener('click', dom.renameStatus);
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
                let column_order = statusColumn.parentNode.getAttribute('order');
                if (column_order == card.status_order && statusColumn.getAttribute('boardId') == card.board_id) {
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
    },
    renameBoard: function(event){
        let title_to_enable_rename = event.target
        let form = title_to_enable_rename.parentNode.children[1];
        form.classList.remove('hide')
        title_to_enable_rename.classList.add('hide')
        let save = form.children[1]
        save.addEventListener('click', ()=>{
            let inputValue = form.children[0].value
            if (inputValue != ''){
                let data = {
                    'id' : form.id,
                    'title': inputValue
                }
                dataHandler.renameBoard(data)
            }
        })
    },
    renameStatus: function(event){
        let statusTitle = event.target;
        let form = statusTitle.parentNode.children[1];
        let target_order = parseInt(statusTitle.parentNode.children[2].getAttribute('data-order'));
        let _board_id = parseInt(statusTitle.parentNode.parentNode.getAttribute('data-id'));
        statusTitle.classList.add('hide')
        form.classList.remove('hide')
        form.addEventListener('keypress', (event)=>{
            if (event.key === 'Enter'){
                let inputValue = form.children[0].value
                if (inputValue != ''){
                    let data = {
                        'id' : form.id,
                        'target_order': target_order,
                        'board_id': _board_id,
                        'title': inputValue
                    }
                    dataHandler.renameStatus(data)
                }
            }
        })
    },
    create_new_board: function(){
        let add_new_board_button = document.querySelector('#new-board');
        add_new_board_button.addEventListener('click', function () {
            let data = prompt('New Board name:');
            dataHandler.createNewBoard(data, dom.displayNewBoard)
        })
    },
    displayNewBoard:function(data){
        dom.createBoard(data);
        dom.loadStatuses(data.id)
    },
    addNewColumn: function(boardId) {
      let new_status_name = prompt('Name of new status:');
      let new_order = prompt('Order of the new status column');
      let data = {'status': {'order_id': new_order,
                             'title':new_status_name},
                  'boardID':boardId};
      dataHandler.addNewColumn(data, function() {
          dom.loadStatuses(data.boardID);
      })
    },
    deleteBoard: function(boardId){
        let boardSection = document.querySelector(`#board-${boardId}`)
        boardSection.remove()
        let data = { 'id' : boardId,
                 'table' : 'boards'
        }
        dataHandler.deleteBoard(data)
    }
};
