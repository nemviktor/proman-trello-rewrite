import os

from flask import json, Flask, render_template, url_for, request, redirect, make_response, jsonify, session

import hash_password
from util import json_response

import data_handler

app = Flask(__name__)
app.secret_key = os.environ.get('secret_key')

@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    boards = data_handler.get_data_on_boards('boards')
    boards_filtered = []
    if 'user_id' in session:
        for board in boards:
            if board['owner'] == 0 or board['owner'] == session['user_id']:
                boards_filtered.append(board)
    else:
        for board in boards:
            if board['owner'] == 0:
                boards_filtered.append(board)
    return boards_filtered


@app.route("/get-cards/<int:board_id>")
@json_response
def get_all_cards(board_id):
    return data_handler.get_data_on_cards('cards', board_id)


@app.route("/get-statuses/<int:boardid>")
@json_response
def get_statuses(boardid):
    result = data_handler.get_statuses_from_table('statuses', 'board_statuses', boardid)
    return result


@app.route('/rename_board', methods=['POST', 'GET'])
@json_response
def rename_board():
    data = request.get_json()
    response = data_handler.rename_board(data['id'], data['title'])
    return response


@app.route('/rename_status', methods=['POST', 'GET'])
@json_response
def rename_status():
    data = request.get_json()
    response = data_handler.rename_status(data['id'], data['title'], data['board_id'], data['target_order'])
    return response


@app.route('/rename_card', methods=['POST', 'GET'])
@json_response
def rename_card():
    card = request.get_json()
    response = data_handler.rename_card(int(card['id']), card['title'])
    return response


@app.route("/create_new_board", methods=['POST', 'GET'])
@json_response
def create_new_board():
    boardTitle = request.get_json()
    data_handler.create_new_board(boardTitle)
    data = data_handler.last_id('boards', 'title', boardTitle)
    data_handler.add_default_statuses_to_board(data['id'])
    return data['id']


@app.route("/create_new_private_board", methods=['POST', 'GET'])
@json_response
def create_new_private_board():
    boardTitle = request.get_json()
    owner = session['user_id']
    data_handler.create_new_private_board(boardTitle, owner)
    data = data_handler.last_id('boards', 'title', boardTitle)
    data_handler.add_default_statuses_to_board(data['id'])
    return data['id']


@app.route("/create_new_card", methods=['POST', 'GET'])
@json_response
def create_new_card():
    dataset = request.get_json()
    cardTitle = dataset['title']
    boardId = dataset['brdid']
    statusId = dataset['status']
    boardStatusId = dataset['boardStatusId']
    data_handler.create_new_card(cardTitle, boardId, statusId, boardStatusId)
    data = data_handler.last_card('cards', 'title', cardTitle)
    return data


@app.route("/add-new-column", methods=['POST', 'GET'])
@json_response
def add_new_column():
    data = request.get_json()
    data_handler.add_new_column(data['title'], data['board'])
    return data['board']


@app.route("/delete_data", methods=['POST', 'GET'])
@json_response
def delete_data():
    data = request.get_json()
    data_handler.delete_data(int(data['id']), data['table'])
    if data['table'] == 'boards':
        data_handler.delete_data_from_board_status(data['id'])
    return f'delete: {data}'


@app.route("/delete-status/<int:id>", methods=['POST', 'GET'])
def delete_status(id):
    return data_handler.delete_status(id)


@app.route("/registration", methods=["GET", "POST"])
def registration():
    data = request.data
    data_decode = data.decode('UTF-8')
    data_decode_dict = json.loads(data_decode)

    # email = data_decode_dict["email"]
    username = data_decode_dict['username']
    password = data_decode_dict['password']

    hashed_password = hash_password.hash_password(password)
    data_handler.save_user_data(username, hashed_password)
    return jsonify("successful registration")


@app.route('/check-username/<username>', methods=["GET", "POST"])
def check_username(username):
    result = jsonify(False)
    usernames = data_handler.list_usernames()
    for element in usernames:
        if element['user_name'] == username:
            result = jsonify(True)
    return result


@app.route('/check-login-data', methods=['GET', 'POST'])
def check_login_data():
    data = request.data
    data_decode = data.decode('UTF-8')
    data_decode_dict = json.loads(data_decode)

    username = data_decode_dict['username']
    plain_text_password = data_decode_dict['password']

    if 'username' not in session:
        session.clear()
        session.permanent = True
        hashed_password = data_handler.get_user_password(username)
        if hashed_password is None:
            result = jsonify(False)
            return result
        elif hash_password.verify_password(plain_text_password, hashed_password['password']):
            session['user_name'] = username
            session['user_id'] = data_handler.get_user_id_by_username(username)['id']
            result = jsonify(True)
            return result
    else:
        result = jsonify("already")
        return result


@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')



def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
