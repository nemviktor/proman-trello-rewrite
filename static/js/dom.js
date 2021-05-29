import {dataHandler} from "./data_handler.js";

let modal = document.getElementById("myModal");



export let dom = {
    init: function () {
    },
    loadBoards: function () {
        dataHandler.getBoards(function (boards) {
            console.log(boards);
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
        clone.querySelector('.card-add').addEventListener('click', dom.modalCard)
        clone.querySelector('.board-status-add').setAttribute('add-status-board-id', board.id);
        clone.querySelector('.board-status-add').addEventListener('click',dom.modalColumn)
        clone.querySelector('.board-columns').id = board.id;
        clone.querySelector('.board-columns').setAttribute('data-id', board.id);
        clone.querySelector('.board-toggle').addEventListener('click', dom.boardToggle)
        boardContainer.appendChild(clone);
    },
    loadStatuses: function (boardId) {
        dataHandler.getStatuses(boardId, function (boardId, statuses) {
            dom.showStatuses(boardId, statuses, dom.loadCards);
        });
    },
    showStatuses: function (boardId, statuses, callback) {
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
        clone.querySelector('.status-form').classList.add(`status-${status.id}`);
        clone.querySelector('.board-column-content').id = status.id;
        clone.querySelector('.board-column-content').setAttribute('boardid', boardId);
        clone.querySelector('.board-column-content').setAttribute('data-order', status.order_id);
        clone.querySelector('.board-column-content').setAttribute('status-title', status.title);
        clone.querySelector('.board-column-content').setAttribute('data-status-id', status.id);
        boardColumn.appendChild(clone);
    },
    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.showCards(cards)
        })
    },
    showCards: function (cards) {
        for (let card of cards) {
            dom.createCard(card);
            dom.renameCard(card.id, card.title, card.board_id)
        }
        dom.checkStatusEmpty();
        // dom.dragging();
    },
    createCard(card) {
        let cardContainers = document.querySelectorAll('.board-column-content');
        let template = document.querySelector('.card-template');
        let clone = template.content.cloneNode('true');
        clone.querySelector('.card').setAttribute('draggable', 'true');
        clone.querySelector('.card').setAttribute('card-order', `${card.order}`);
        clone.querySelector('.card').id = `${card.id}`;
        clone.querySelector('.card').setAttribute('data_status', `${card.status_id}`);
        clone.querySelector('.card').addEventListener('dragstart', dom.dragging)
        clone.querySelector('.card-remove').id = `${card.id}`;
        clone.querySelector('.card-remove').addEventListener('click',dom.deleteCard);
        clone.querySelector('.card-title').id = `${card.id}`;
        clone.querySelector('.card-title').innerHTML = `${card.title}`;

        for (let statusColumn of cardContainers) {
            let column_order = statusColumn.parentNode.getAttribute('order');
            if (card.status_order) {
                if (column_order == card.status_order && statusColumn.getAttribute('boardId') == card.board_id) {
                    statusColumn.appendChild(clone);
                }
            } else {
                if (column_order == card.status_id && statusColumn.getAttribute('boardId') == card.board_id) {
                    statusColumn.appendChild(clone);
                }
            }
        }
    },
    boardToggle: function(event){
        let board = event.currentTarget.parentNode.nextElementSibling
        board.classList.toggle('hide')
    },
    renameBoard: function (event) {
        let title_to_enable_rename = event.target
        let form = title_to_enable_rename.parentNode.children[1];
        form.classList.remove('hide')
        title_to_enable_rename.classList.add('hide')
        let save = form.children[1]
        save.addEventListener('click', () => {
            let inputValue = form.children[0].value
            if (inputValue != '') {
                let data = {
                    'id': form.id,
                    'title': inputValue
                }
                dataHandler.renameBoard(data)
            }
        })
    },
    renameStatus: function (event) {
        let statusTitle = event.target;
        let form = statusTitle.parentNode.children[1];
        let target_order = parseInt(statusTitle.parentNode.children[2].getAttribute('data-order'));
        let _board_id = parseInt(statusTitle.parentNode.parentNode.getAttribute('data-id'));
        statusTitle.classList.add('hide')
        form.classList.remove('hide')
        form.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                let inputValue = form.children[0].value
                if (inputValue != '') {
                    let data = {
                        'id': form.id,
                        'target_order': target_order,
                        'board_id': _board_id,
                        'title': inputValue
                    }
                    dataHandler.renameStatus(data)
                }
            }
        })
    },
    renameCard: function (cardId, title, boardId) {
        let cardTitles = document.querySelectorAll('.card-title')
        for (let cardTitle of cardTitles) {
            if (cardTitle.id == cardId) {
                cardTitle.addEventListener('click', function () {
                    const outerHtml = `
                        <form class="card-form" id="card-${cardId}">
                            <input type="text" class="new-name">
                        </form>`;
                    cardTitle.insertAdjacentHTML("afterend", outerHtml);
                    let trash = cardTitle.parentNode.children[0]
                    cardTitle.classList.add('hide');
                    trash.classList.add('hide');
                    let form = document.querySelector(`#card-${cardId}`);
                    form.addEventListener('keypress', (event) => {
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
    addNewBoard: function () {
        let add_new_board_button = document.querySelector('#new-board');
        add_new_board_button.addEventListener('click', function() {
            dom.modalBoard();
        });
    },
    modalBoard: function () {
        let modal = document.getElementById('myModal_board');

        modal.style.display = "block";
        let x = document.querySelector('.close-board');
        x.addEventListener('click', function () {
            modal.style.display = "none";
        })

        let closeButton = document.querySelector('.board-close-button');
        closeButton.addEventListener('click', function () {
            modal.style.display = "none";
        })

        let submitBoardButton = document.getElementById('submit-board');
        submitBoardButton.addEventListener('click', () => {
            let boardTitle = document.querySelector('.input_board_title').value;
            if (boardTitle !== null && boardTitle !== '') {
                dataHandler.createNewBoard(boardTitle, dom.loadStatuses)
            }
        })
    },
    displayNewCard: function (card) {
        console.log(`displaycard ${card}`)
        dom.createCard(card);
    },
    handleNewCard: function (event) {
        event.preventDefault();
        let modal = document.getElementById('myModal_card');
        let cardTitle = event.currentTarget.previousElementSibling.previousElementSibling.value;
        console.log(cardTitle)
        let boardId = parseInt(event.currentTarget.dataset.boardid);
        let statusId = 1;
        let orderId = 1;
        modal.style.display = "none";
        dataHandler.createNewCard(cardTitle, boardId, statusId, orderId, dom.displayNewCard)
    },
    modalCard: function (event) {
        let modal = document.getElementById('myModal_card');
        modal.style.display = "block";
        // dom.closeModalX();
        // dom.closeModalButton();
        let x = document.querySelector('.close-card');
        x.addEventListener('click', function () {
            modal.style.display = "none";
        })

        let closeButton = document.querySelector('.card-close-button');
        closeButton.addEventListener('click', function () {
            modal.style.display = "none";
        })

        let submitCardButton = document.getElementById('submit-card');
        submitCardButton.dataset.boardid = event.currentTarget.dataset.boardId;

        submitCardButton.addEventListener('click', dom.handleNewCard)
    },
    modalColumn: function() {
        let modal = document.getElementById('myModal_col');
        // dom.closeModalX();
        // dom.closeModalButton();
        modal.style.display = "block";
        let x = document.querySelector('.close-status');
        x.addEventListener('click', function () {
            modal.style.display = "none";
        })

        let closeButton = document.querySelector('.status-close-button');
        closeButton.addEventListener('click', function () {
            modal.style.display = "none";
        })

        let submitStatusButton = document.getElementById('submit-status');
        submitStatusButton.addEventListener('click', () => {
            let statusTitle = document.getElementById('status_id').value;
            if (statusTitle !== null && statusTitle !== '') {
                dataHandler.createNewStatus(statusTitle, dom.loadStatuses)
            }
        })
    },
    deleteBoard: function(event){
        let board = event.currentTarget.parentNode;
        board.parentElement.remove();
        let data = { 'id' : board.id,
                 'table' : 'boards'
    // addNewColumn: function (boardId) {
    //     let new_status_name = prompt('Name of new status:');
    //     let new_order = prompt('Order of the new status column');
    //     let data = {
    //         'status': {
    //             'order_id': new_order,
    //             'title': new_status_name
    //         },
    //         'boardID': boardId
    //     };
    //     dataHandler.addNewColumn(data, function () {
    //         dom.loadStatuses(data.boardID);
    //     })
    // },
    // deleteBoard: function (boardId) {
    //     let boardSection = document.querySelector(`#board-${boardId}`)
    //     boardSection.remove()
    //     let data = {
    //         'id': boardId,
    //         'table': 'boards'
        }
        dataHandler.deleteData(data, response => console.log(response))
    },
    deleteCard: function (event) {
        let card = event.currentTarget;
        let cardId = card.id;
        card.parentNode.remove()
        let data = {
            'id': cardId,
            'table': 'cards'
        }
        dataHandler.deleteData(data, response => console.log(response))
    },
    switch: function () {
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
    setTheme: function (theme) {
        let checkbox = document.getElementById('checkbox');
        let link = document.querySelector('#css-link');
        if (theme == 'dark') {
            checkbox.setAttribute('data-theme', 'light')
            checkbox.checked = false;
            link.href = 'static/css/dark_design.css'
        } else if (theme == 'light') {
            checkbox.setAttribute('data-theme', 'dark')
            link.href = 'static/css/light_design.css'
            checkbox.checked = true;
        }
        localStorage.setItem('style', theme)
    },
    dragging: function (event) {
        let card = event.currentTarget;
        card.classList.add('dragging');
        let droppables = document.querySelectorAll('.droppable');
        for (let drop_neighbour of droppables) {
            drop_neighbour.addEventListener('dragover', (event) => {
                let dragged_element = document.querySelector('.dragging');
                if (event.target.classList.contains('droppable')) {
                    drop_neighbour.insertAdjacentElement('afterend', dragged_element);
                    dom.checkStatusEmpty()
                }
            })
        }
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            console.log(card.parentNode.children[0])
            if (card.parentNode.children[0].classList.contains('empty')){
                console.log(card.parentNode.children)
                card.parentNode.removeChild(card.parentNode.children[0]);
            }
        })
    },

    // dragging: function () {
    //     let draggable_cards = document.querySelectorAll('.card');
    //     for (let card of draggable_cards) {
    //         card.addEventListener('dragstart', (event) => {
    //             card.classList.add('dragging');
    //             // dom.checkStatus();
    //
    //             // if (event.target.parentNode.childNodes.length == 3) {
    //             //     let new_drop_neighbour = document.createElement('div');
    //             //     new_drop_neighbour.classList.add('droppable');
    //             //     new_drop_neighbour.innerHTML = "Drop something here!";
    //             //     let container = event.target.parentNode;
    //             //     container.appendChild(new_drop_neighbour);
    //             // }
    //
    //             let droppables = document.querySelectorAll('.droppable');
    //             for (let drop_neighbour of droppables) {
    //                 drop_neighbour.addEventListener('dragover', (event) => {
    //                     let dragged_element = document.querySelector('.dragging');
    //                     if (event.target.classList.contains('droppable')) {
    //                         drop_neighbour.insertAdjacentElement('afterend', dragged_element);
    //                         dom.checkStatus()
    //                     }
    //                 })
    //             }
    //         })
    //         card.addEventListener('dragend', () => {
    //             card.classList.remove('dragging');
    //             console.log(card.parentNode.children[0])
    //             if (card.parentNode.children[0].classList.contains('empty')){
    //                 console.log(card.parentNode.children)
    //                 card.parentNode.removeChild(card.parentNode.children[0]);
    //             }
    //         })
    //
    //         let droppables = document.querySelectorAll('.droppable');
    //         console.log(droppables)
    //         for (let drop_neighbour of droppables) {
    //             drop_neighbour.addEventListener('dragover',(event) => {
    //                 let dragged_element = document.querySelector('.dragging');
    //                 if (event.target.classList.contains('droppable')) {
    //                     drop_neighbour.insertAdjacentElement('afterend',dragged_element);
    //                 }
    //             })
    //         }
    //     }
    // },
    checkStatusEmpty: function(){
    let boardColumnContents = document.querySelectorAll('.board-column-content')
    for (let content of boardColumnContents){
        if(content.children.length == 0) {
            let new_drop_neighbour = document.createElement('div');
            new_drop_neighbour.classList.add('droppable');
            new_drop_neighbour.classList.add('empty');
            new_drop_neighbour.innerHTML = " ";
            content.appendChild(new_drop_neighbour);
            }
        }
    },

    closeModalX: function (){
        let closeX = document.querySelector('.close');
        closeX.addEventListener('click', function() {
            modal.style.display = "none";
        })
    },
    closeModalButton: function () {
        let closeButton = document.getElementById('close-button');
        closeButton.addEventListener('click', function () {
            modal.style.display = "none";
        })
    },

    initRegistration: function() {
        modal.style.display = "block";
        document.querySelector('.modal-title').innerText = "Registration";
        let modalBody = document.querySelector('.modal-body');
        let htmlText =
            `<div class="registration-container">
                <form id="form" > 
                    <p id="error" hidden>Username already exists, please choose another one!</p>
                    <div><label for="username">Username:</label></div>
                    <div><input type="text" id="username" name="username" required></div>
                    <div><label for="password">Password:</label></div>
                    <div><input type="password" id="password" name="password" required></div>
                    <div><label for="password_2">Password again:</label></div>
                    <div><input type="password" id="password_2" name="password_2" required></div>
                        
                    <div><button id="confirm-button" class="btn btn-primary" type="submit">Confirm</button></div>
                </form>
            </div>`;
        modalBody.innerHTML = htmlText;

        dom.closeModalX();
        dom.closeModalButton();

        let form = document.getElementById('form')
        form.onsubmit = dom.submitRegistration;
    },

    submitRegistration: function (event) {
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let error = document.getElementById("error");
        let registerDiv = document.querySelector('.registration-container');
        let modalBody = document.querySelector('.modal-body');
        event.preventDefault();
        fetch('/check-username/' + username)
            .then(resp => resp.json())
            .then(data => {
                if (data) {
                    error.removeAttribute('hidden');
                } else {
                    const userData = {username: username, password: password};
                    fetch('/registration', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData),
                        })
                        .then(resp => resp.json())
                        .then(data => console.log(data))
                        .then(function (){
                            error.setAttribute('hidden', '');
                            registerDiv.remove();

                            modalBody.innerHTML =
                                `<p>Successful registration. Log in to continue.</p>
                                <form id="login-form"> 
                                    <button id="login-button" class="btn btn-primary" type="submit">Login</button>
                                </form>`;
                            document.getElementById('login-button').addEventListener('click', dom.initLogin);
                            })
                    }
            });

    },
    registration: function () {
        let registration = document.getElementById("register");
        registration.addEventListener('click', dom.initRegistration);
    },

    login: function () {
        let login = document.getElementById("login");
        login.addEventListener('click', dom.initLogin);
    },
    initLogin: function() {
        modal.style.display = "block";
        document.querySelector('.modal-title').innerText = "Login";
        let modalBody = document.querySelector('.modal-body');
        let htmlText =
            `<div class="login-container">
                <form id="login-form" > 
                    <p id="error" hidden>Wrong username or password.</p>
                    <p id="error-loggedIn" hidden>You are already logged in</p>
                    <div><label for="username">Username:</label></div>
                    <div><input type="text" id="username" name="username" required></div>
                    <div><label for="password">Password:</label></div>
                    <div><input type="password" id="password" name="password" required></div>
                    <div><button id="confirm-button" class="btn btn-primary" type="submit">Confirm</button></div>
                </form>
            </div>`;
        modalBody.innerHTML = htmlText;
        dom.closeModalX()
        dom.closeModalButton()

        let form = document.getElementById('login-form')
        form.onsubmit = dom.submitLogin;
    },
    submitLogin: function(event) {
        event.preventDefault();
        let error = document.getElementById("error");
        let errorLoggedIn = document.getElementById("error-loggedIn");
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let dataLogin = {username: username, password: password};
        fetch('/check-login-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify(dataLogin),
            })
            .then(response => response.json())
            .then(data => {
                if (data == false) {
                    error.removeAttribute('hidden');
                } else if (data == true) {
                    document.location.href="/";
                } else if (data == "already") {
                    errorLoggedIn.removeAttribute('hidden');
                    }
                })
    },



}

