from flask import Flask, render_template, url_for, request, redirect, make_response, jsonify
from util import json_response

import data_handler

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    return data_handler.get_data_on_boards('boards')


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


@app.route("/create_new_card", methods=['POST', 'GET'])
@json_response
def create_new_card():
    dataset = request.get_json()
    cardTitle = dataset['title']
    boardId = dataset['brdid']
    statusId = dataset['status']
    data_handler.create_new_card(cardTitle, boardId, statusId)
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


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
