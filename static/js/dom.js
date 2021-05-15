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
    },
    createBoard: function (board){
        let boardContainer = document.querySelector('.board-container');
        let template = document.querySelector('.board-template');
        let clone = template.content.cloneNode('true');
        clone.querySelector('.board').id = board.id;
        clone.querySelector('.board-header').id = board.id;
        clone.querySelector('.board-title').id = `title ${board.id}`;
        clone.querySelector('.board-title').innerText = board.title;
        clone.querySelector('.board-title').addEventListener('click', dom.renameBoard)
        clone.querySelector('.board-form').id = board.id;
        clone.querySelector('.board-remove').setAttribute('delete-board-id', board.id);
        clone.querySelector('.board-remove').addEventListener('click',dom.deleteBoard);
        clone.querySelector('.card-add').setAttribute('data-board-id', board.id);
        clone.querySelector('.card-add').addEventListener('click', dom.modalDisplay)
        clone.querySelector('.board-status-add').setAttribute('add-status-board-id', board.id);
        clone.querySelector('.board-status-add').addEventListener('click',dom.addNewColumn)
        clone.querySelector('.board-columns').id = board.id;
        clone.querySelector('.board-columns').setAttribute('data-id', board.id);
        clone.querySelector('.board-toggle').addEventListener('click', dom.boardToggle)
        boardContainer.appendChild(clone);
        // dom.initNewCardButton();
    },
    loadStatuses: function (boardId) {
        dataHandler.getStatuses(boardId,function (boardId, statuses) {
            dom.showStatuses(boardId, statuses, dom.loadCards);
        });
    },
    showStatuses: function (boardId, statuses, callback) {
        let statusContainerAreas = document.querySelectorAll('.board-columns');
        console.log(statusContainerAreas)
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
        let boardColumn = document.querySelector(`[data-id="${boardId}"]`);
        let template = document.querySelector('.status-template');
        let clone = template.content.cloneNode('true');
        clone.querySelector('.board-column').setAttribute('order', status.order_id);
        clone.querySelector('.board-column-title').id = `status-${status.id}`;
        clone.querySelector('.board-column-title').innerText = status.title;
        clone.querySelector('.board-column-title').addEventListener('click', dom.renameStatus)
        clone.querySelector('.status-form').id = status.id;
        clone.querySelector('.board-column-content').id = status.id;
        clone.querySelector('.board-column-content').setAttribute('boardid', boardId);
        clone.querySelector('.board-column-content').setAttribute('data-order', status.order_id);
        clone.querySelector('.board-column-content').setAttribute('status-title', status.title);
        clone.querySelector('.board-column-content').setAttribute('data-status-id', status.id);
        boardColumn.appendChild(clone);
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
    boardToggle: function(event){
        let board = event.currentTarget.parentNode.nextElementSibling
        board.classList.toggle('hide')

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

    // initNewCardButton:function () {
    //     let addCardButton = document.querySelectorAll('.card-add');
    //     for (let button of addCardButton) {
    //         button.addEventListener('click', dom.modalDisplay);
    //     }
    // },
    addNewColumn: function(event) {
      let boardId = event.currentTarget.parentNode.id;
      let new_status_name = prompt('Name of new status:');
      let new_order = prompt('Order of the new status column');
      let data = {'status': {'order_id': new_order,
                             'title':new_status_name},
                  'boardID':boardId};
      dataHandler.addNewColumn(data, function() {
          dom.loadStatuses(data.boardID);
      })
    },
    deleteBoard: function(event){
        let board = event.target.parentNode.parentNode.parentNode
        board.remove()
        let data = { 'id' : board.id,
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
    switch: function() {
        let checkbox = document.getElementById('checkbox');
        let style = localStorage.getItem('style');
        if (style == null) {
            dom.setTheme('dark')
        } else {
            dom.setTheme(style);
        }

        checkbox.addEventListener('change', (event) => {
            let theme = event.target.dataset.theme
            dom.setTheme(theme)
        })
        //
    },
    setTheme: function(theme){
        let checkbox = document.getElementById('checkbox');
        console.log(theme)
        let link = document.querySelector('#css-link');
            if(theme == 'dark'){
                checkbox.setAttribute('data-theme', 'light')
                checkbox.checked = false;
                link.href='static/css/dark_design.css'
            } else if (theme == 'light'){
                checkbox.setAttribute('data-theme', 'dark')
                link.href= 'static/css/light_design.css'
                checkbox.checked = true;
            }
            localStorage.setItem('style', theme)
    }

};
