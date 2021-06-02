import {dataHandler} from "./data_handler.js";

let modal = document.getElementById("myModal");
let modalBody = document.querySelector('.modal-body');


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
        if (board.owner !== 0) {
            clone.querySelector('.board-title').innerText = board.title + " (private)";
        } else {
            clone.querySelector('.board-title').innerText = board.title + " (public)";
        }
        clone.querySelector('.board-title').addEventListener('click', dom.renameBoard)
        clone.querySelector('.board-form').id = board.id;
        clone.querySelector('.board-remove').setAttribute('delete-board-id', board.id);
        clone.querySelector('.board-remove').addEventListener('click',dom.deleteBoard);
        clone.querySelector('.card-add').setAttribute('data-board-id', board.id);
        clone.querySelector('.card-add').addEventListener('click', dom.modalCard)
        clone.querySelector('.board-status-add').setAttribute('add-status-board-id', board.id);
        clone.querySelector('.board-status-add').addEventListener('click',() => {
            dom.modalColumn(board.id);
        })
        clone.querySelector('.board-columns').id = board.id;
        clone.querySelector('.board-columns').setAttribute('data-id', board.id);

        clone.querySelector('.board-toggle').addEventListener('click', dom.boardToggle)
        boardContainer.appendChild(clone);
    },
    loadStatuses: function (boardId) {
        Promise.all([dataHandler.getStatuses(boardId, function (boardId, statuses) {
            dom.showStatuses(boardId, statuses, dom.loadCards);
        })])
            .then(response => dom.checkStatusEmpty())
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
        clone.querySelector('.board-column').setAttribute('data-board-status-id', status.board_status_id);
        clone.querySelector('.board-column').setAttribute('draggable', 'true');
        clone.querySelector('.board-column').addEventListener('dragstart', dom.dragging_status);

        clone.querySelector('.board-column-title').id = `status-${status.id}`;
        clone.querySelector('.board-column-title').innerText = status.title;
        clone.querySelector('.board-column-title').addEventListener('click', dom.renameStatus)
        clone.querySelector('.status-form').classList.add(`status-${status.id}`);
        clone.querySelector('.board-column-content').id = status.id;
        clone.querySelector('.board-column-content').setAttribute('boardid', boardId);
        clone.querySelector('.board-column-content').setAttribute('data-order', status.order_id);
        clone.querySelector('.board-column-content').setAttribute('status-title', status.title);
        clone.querySelector('.board-column-content').setAttribute('data-status-id', status.id);
        clone.querySelector('.status-remove').setAttribute('id', status.id);
        clone.querySelector('.status-remove').setAttribute('data-board-status-id', status.board_status_id);
        clone.querySelector('.status-remove').addEventListener('click',dom.deleteStatus);
        boardColumn.appendChild(clone);
    },
    deleteStatus:function (event) {
        let id = parseInt(event.currentTarget.dataset.boardStatusId);
        dataHandler.deleteStatus(id);
        event.currentTarget.parentElement.parentElement.remove();
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

    },
    createCard(card) {
        let cardContainers = document.querySelectorAll('.board-column-content');
        let template = document.querySelector('.card-template');
        let clone = template.content.cloneNode('true');
        clone.querySelector('.card').setAttribute('draggable', 'true');
        clone.querySelector('.card').setAttribute('card-order', `${card.order}`);
        clone.querySelector('.card').id = `${card.id}`;
        clone.querySelector('.card').setAttribute('data_status', `${card.status_id}`);
        clone.querySelector('.card').addEventListener('dragstart', dom.dragging_card);
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
        form.children[0].addEventListener('change', () => {
            let inputValue = form.children[0].value
            if (inputValue != '') {
                let data = {
                    'id': form.id,
                    'title': inputValue}
                window.addEventListener('click', function() {
                    form.submit();
                    dataHandler.renameBoard(data, console.log);
                })
            }
        })
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
        window.addEventListener('click', function() {
            let inputValue = form.children[0].value
            if (inputValue != '') {
                let data = {
                    'id': form.id,
                    'target_order': target_order,
                    'board_id': _board_id,
                    'title': inputValue};
                form.submit();
                dataHandler.renameStatus(data)
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
                    window.addEventListener('click', function() {
                        let inputValue = form.children[0].value
                        if (inputValue != '') {
                            let data = {
                                'id': cardId,
                                'board_id': boardId,
                                'title': inputValue
                            }
                            form.submit();
                            dataHandler.renameCard(data, response => console.log(response))
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
    addNewPrivateBoard: function () {
        let add_new_private_board_button = document.querySelector('#new-private-board');
        add_new_private_board_button.addEventListener('click', function() {
            dom.modalPrivateBoard();
        });
    },
    modalPrivateBoard: function () {
        dom.displayModal();
        dom.setModalTitle("Add New Private Board");
        let htmlText =
            `<div class="registration-container">
                <form id="form" > 
                    <input class="input_board_title" type="text" placeholder="Board title" name="title" required>
                    <div><button id="confirm-button" class="btn btn-primary" type="submit">Confirm</button></div>
                </form>
            </div>`;
        dom.setModalBodyInnerHTML(htmlText);
        dom.closeModalX();
        dom.closeModalButton();

        let submitBoardButton = document.getElementById('confirm-button');
        submitBoardButton.addEventListener('click', () => {
            let boardTitle = document.querySelector('.input_board_title').value;
            if (boardTitle !== null && boardTitle !== '') {
                dataHandler.createNewPrivateBoard(boardTitle, dom.loadStatuses)
            }
        })
    },
    modalBoard: function () {
        dom.displayModal();
        dom.setModalTitle("Add New Private Board");
        let htmlText =
            `<div class="registration-container">
                <form id="form" > 
                    <input class="input_board_title" type="text" placeholder="Board title" name="title" required>
                    <div><button id="confirm-button" class="btn btn-primary" type="submit">Confirm</button></div>
                </form>
            </div>`;
        dom.setModalBodyInnerHTML(htmlText);
        dom.closeModalX();
        dom.closeModalButton();

        let submitBoardButton = document.getElementById('confirm-button');
        submitBoardButton.addEventListener('click', () => {
            let boardTitle = document.querySelector('.input_board_title').value;
            if (boardTitle !== null && boardTitle !== '') {
                dataHandler.createNewBoard(boardTitle, dom.loadStatuses)
            }
        })
    },
    displayNewCard: function (card) {
        dom.createCard(card);
    },
    handleNewCard: function (event) {
        event.preventDefault();
        let cardTitle = event.currentTarget.previousElementSibling.previousElementSibling.value;
        let boardId = parseInt(event.currentTarget.dataset.boardid);
        let statusId = 1;
        let orderId = 1;
        let boardStatusId = parseInt(event.currentTarget.dataset.boardStatusid)
        dom.hideModal();

        dataHandler.createNewCard(cardTitle, boardId, statusId, orderId, boardStatusId, dom.displayNewCard)
    },
    modalCard: function (event) {
        dom.displayModal();
        dom.setModalTitle("Add New Card");
        let htmlText =
            `<div class="registration-container">
                <form>
                    <input type="text" placeholder="Card title" name="title" required>
                    <br>
                    <button id="submit-card" data-boardid="" data-board-statusid="">Submit</button>
                </form>
            </div>`;
        dom.setModalBodyInnerHTML(htmlText);
        dom.closeModalX();
        dom.closeModalButton();

        let submitCardButton = document.getElementById('submit-card');
        submitCardButton.dataset.boardid = event.currentTarget.dataset.boardId;
        submitCardButton.dataset.boardStatusid = event.currentTarget.parentElement.nextElementSibling.firstElementChild.dataset.boardStatusId;

        submitCardButton.addEventListener('click', dom.handleNewCard)
    },
    modalColumn: function(boardId) {
        dom.displayModal();
        dom.setModalTitle("Add Status");
        let htmlText =
            `<div class="registration-container">
                <form>
                    <input id="status_id" type="text" placeholder="Status title" name="title" required>
                    <br>
                    <button id="submit-status" data-boardid="">Submit</button>
                </form>
            </div>`;
        dom.setModalBodyInnerHTML(htmlText);
        dom.closeModalX();
        dom.closeModalButton();

        let submitStatusButton = document.getElementById('submit-status');
        submitStatusButton.addEventListener('click', () => {
            let statusTitle = document.getElementById('status_id').value;
            if (statusTitle !== null && statusTitle !== '') {
                let data = {'title': statusTitle,
                            'board': boardId}
                dataHandler.createNewStatus(data, dom.loadStatuses)
            }
        })
    },
    deleteBoard: function(event){
        let board = event.currentTarget.parentNode;
        board.parentElement.remove();
        let data = { 'id' : board.id,
                 'table' : 'boards'
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
        dataHandler.deleteData(data, dom.checkStatusEmpty)
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
    dragging_card: function (event) {
        let card = event.currentTarget;
        card.classList.add('dragging');
        let droppables = document.querySelectorAll('.droppable');
        for (let drop_neighbour of droppables) {
            drop_neighbour.addEventListener('dragover', (event) => {
                let dragged_element = document.querySelector('.dragging');
                if (event.target.classList.contains('droppable') && event.target.classList.contains('card')) {
                    drop_neighbour.insertAdjacentElement('afterend', dragged_element);
                    dom.checkStatusEmpty()
                }
            })
        }
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            if (card.parentNode.children[1].classList.contains('empty')) {
                card.parentNode.removeChild(card.parentNode.children[1]);
            }
        })
    },
    dragging_status: function(event){
        //status column drag and drop
        let current_status = event.currentTarget;
        current_status.classList.add('dragging');
        let status_dropzones = document.querySelectorAll('.dropzone');
        for (let drop_target of status_dropzones) {
            drop_target.addEventListener('dragover', (event) => {
                let dragged_element = document.querySelector('.dragging');
                if (event.target.classList.contains('dropzone') && event.target.classList.contains('board-column')) {
                    drop_target.insertAdjacentElement('afterend', dragged_element);
                }
            })
        }
        current_status.addEventListener('dragend', () => {
            current_status.classList.remove('dragging');
            // if (current_status.parentNode.children[0].classList.contains('empty')){
            //     card.parentNode.removeChild(card.parentNode.children[0]);
            // }
        })
    },
    checkStatusEmpty: function(){
    let boardColumnContents = document.querySelectorAll('.board-column-content')
    for (let content of boardColumnContents){
        if(content.children.length == 1) {
            let new_drop_neighbour = document.createElement('div');
            new_drop_neighbour.classList.add('droppable');
            new_drop_neighbour.classList.add('empty');
            new_drop_neighbour.innerHTML = " ";
            content.appendChild(new_drop_neighbour);
            }
        }
    },
    hideModal: function () {
        modal.style.display = "none";
    },
    displayModal: function () {
        modal.style.display = "block";
    },
    setModalTitle: function (title) {
        document.querySelector('.modal-title').innerText = title;
    },
    setModalBodyInnerHTML: function (htmlText) {
        modalBody.innerHTML = htmlText;
    },
    closeModalX: function (){
        let closeX = document.querySelector('.close');
        closeX.addEventListener('click', function() {
            dom.hideModal();
        })
    },
    closeModalButton: function () {
        let closeButton = document.getElementById('close-button');
        closeButton.addEventListener('click', function () {
            dom.hideModal();
        })
    },
    initRegistration: function() {
        dom.displayModal();
        dom.setModalTitle("Registration");
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
        dom.setModalBodyInnerHTML(htmlText);
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
        dom.displayModal();
        dom.setModalTitle("Login");
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
        dom.setModalBodyInnerHTML(htmlText);
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
                    console.log(document.getElementById("login"));
                    document.getElementById("login").style.display = "none";
                    document.getElementById("register").style.display = "none";
                    document.location.href="/";
                } else if (data == "already") {
                    errorLoggedIn.removeAttribute('hidden');
                    }
                })
    },
    logout: function () {
        document.getElementById("logout").addEventListener('click', function () {
            document.getElementById("logout").style.display = "none";
            fetch('/logout')
        })
    },
    initMenu: function () {
        if ('user_id' in Session) {

        }
    }
}

