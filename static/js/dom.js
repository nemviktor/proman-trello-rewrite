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
                <div class="board-columns" id="${board.id}" data-id="${board.id}">
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
        dom.initNewCardButton();
    },
    loadStatuses: function (boardId) {
        dataHandler.getStatuses(boardId,function (boardId, statuses) {
            dom.showStatuses(boardId, statuses, dom.loadCards);
        });
    },
    showStatuses: function (boardId, statuses, callback) {
        let statusContainerAreas = document.querySelectorAll('.board-columns');
        if (statusContainerAreas.length > 1){
            for(let area of statusContainerAreas){
                if (statusContainerAreas !== null  ) {
                    statusContainerAreas[boardId-1].innerHTML = '';
                }
            }
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
            if (statusContainerAreas !== null && statusContainerAreas[boardId - 1] !== undefined) {
                statusContainerAreas[boardId-1].insertAdjacentHTML("beforeend", outerHtml);
            }else{
                statusContainerAreas[0].insertAdjacentHTML("beforeend", outerHtml);
            }
            let status_rename = document.querySelector(`#status-${status.id}`);
            status_rename.addEventListener('click', dom.renameStatus);
    },
    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId,function (cards) {
            dom.showCards(cards,dom.deleteCard)
        })
    },
    showCards: function (cards, callback) {
        for (let card of cards) {
            dom.createCard(card);
            dom.renameCard(card.id, card.title, card.board_id)
        }
        callback()
    },
    createCard(card){
        const outerHtml = `
                <div class="card" id="${card.id}" data_status=${card.status_id}>
                    <div class="card-remove" id="${card.id}"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title" id="${card.id}" >${card.title}</div>
               </div>`;
            let cardContainers = document.querySelectorAll('.board-column-content');
            for(let statusColumn of cardContainers){
                let column_order = statusColumn.parentNode.getAttribute('order');
                if (card.status_order) {
                    if (column_order == card.status_order && statusColumn.getAttribute('boardId') == card.board_id) {
                        statusColumn.insertAdjacentHTML("beforeend", outerHtml);
                    }
                } else {
                    if (column_order == card.status_id && statusColumn.getAttribute('boardId') == card.board_id) {
                        statusColumn.insertAdjacentHTML("beforeend", outerHtml);
                        let deleteCardElements = document.querySelectorAll('.card-remove');
                        for (let element of deleteCardElements) {
                            if (element.id == card.id) {
                                element.addEventListener('click', function (event) {
                                    let card = event.target.parentNode.parentNode;
                                    let cardId = card.id
                                    card.remove()
                                    let data = {
                                        'id': cardId,
                                        'table': 'cards'
                                        }
                                    dataHandler.deleteData(data, response => console.log(response))
                                });
                            }
                        }
                    }
                }
            }
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
    renameCard: function(cardId,title, boardId){
        let cardTitles = document.querySelectorAll('.card-title')
        for (let cardTitle of cardTitles){
            if(cardTitle.id == cardId){
                cardTitle.addEventListener('click', function(){
                    const outerHtml = `
                        <form class="card-form" id="card-${cardId}">
                            <input type="text" class="new-name">
                        </form>`;
                    cardTitle.insertAdjacentHTML("afterend", outerHtml);
                    let trash = cardTitle.parentNode.children[0]
                    cardTitle.classList.add('hide');
                    trash.classList.add('hide');
                    let form = document.querySelector(`#card-${cardId}`);
                    form.addEventListener('keypress', (event)=> {
                        if (event.key === 'Enter') {
                            let inputValue = form.children[0].value
                            if (inputValue != '') {
                                let data = {
                                    'id': cardId,
                                    'board_id': boardId,
                                    'title': inputValue
                                }
                                dataHandler.renameCard(data, response => console.log(response))
                            }
                        }
                    })
                })
            }
        }

    },
    create_new_board: function(){
        let add_new_board_button = document.querySelector('#new-board');
        add_new_board_button.addEventListener('click', function () {
            let data = prompt('New Board name:');
            if (data !== null && data !== ''){
                dataHandler.createNewBoard(data, dom.displayNewBoard)
            }
        })
    },
    displayNewBoard:function(data){
        dom.createBoard(data);
        dom.loadStatuses(data.id)
    },
    displayNewCard:function (card) {
        dom.createCard(card);
    },
    handleNewCard: function (event) {
        event.preventDefault();
        let modal = document.getElementById('myModal');
        let cardTitle = event.currentTarget.previousElementSibling.value;
        let boardId = event.currentTarget.dataset.boardid;
        let statusId = 1;
        let orderId = 1;
        modal.style.display = "none";
        dataHandler.createNewCard(cardTitle, boardId, statusId, orderId, dom.displayNewCard)
    },
    modalDisplay:function (event) {
        let modal = document.getElementById('myModal');
        modal.style.display = "block";

        let x = document.querySelector('.close');
        x.addEventListener('click', function () {
            modal.style.display = "none";
        })

        let closeButton = document.querySelector('#close-button');
        closeButton.addEventListener('click', function () {
            //modalBody.innerHTML = "";
            modal.style.display = "none";
        })

        let submitCardButton = document.getElementById('submit-card');
        submitCardButton.dataset.boardid = event.currentTarget.dataset.boardId;

        submitCardButton.addEventListener('click', dom.handleNewCard)
    },
    initNewCardButton:function () {
        let addCardButton = document.querySelectorAll('.board-add');
        for (let button of addCardButton) {
            button.addEventListener('click', dom.modalDisplay);
        }
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
        dataHandler.deleteData(data, response => console.log(response) )
    },
    deleteCard:function(){
       let deleteButtons = document.querySelectorAll('.card-remove');
        for (let deleteButton of deleteButtons) {
            deleteButton.addEventListener('click', function (event) {
                let card = event.target.parentNode.parentNode;
                let cardId = card.id
                card.remove()
                let data = {
                    'id': cardId,
                    'table': 'cards'
                }
                dataHandler.deleteData(data, response => console.log(response))
            });
        }
    },
    switch: function(){
        let switchButton = document.querySelector('#switch');
        switchButton.addEventListener('click', function(){
        let link = document.querySelector('#css-link')
        let sun = document.querySelector('.fa-sun');
        let moon = document.querySelector('.fa-moon');
            if (switchButton.classList.contains('dark')){
                sun.classList.add('hide')
                moon.classList.remove('hide')
                switchButton.classList.remove('dark')
                link.href = "static/css/light_design.css"
                }else{
                link.href = "static/css/dark_design.css"
                switchButton.classList.add('dark')
                sun.classList.remove('hide')
                moon.classList.add('hide')
            }
        })
    }
};
