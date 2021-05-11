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


# @app.route("/get-cards/<int:board_id>")
# @json_response
# def get_cards_for_board(board_id: int):
#     """
#     All cards that belongs to a board
#     :param board_id: id of the parent board
#     """
#     return data_handler.get_cards_for_board(board_id)
@app.route("/get-cards/<int:board_id>")
@json_response
def get_all_cards(board_id):
    return data_handler.get_data_on_cards('cards', board_id)


@app.route("/get-statuses/<int:boardid>")
@json_response
def get_statuses(boardid):
    result = data_handler.get_statuses_from_table('statuses', 'board_statuses', boardid)
    return result


# # @app.route('/rename', methods=['POST', 'GET'])
# @app.route("/rename/<int:boardid>", methods=['POST', 'GET'])
# @json_response
# def rename(boardid):
#     # data = request.get_json()
#
#     if request.method == 'POST':
#         new_name = request.form['new-name']
#     return data_handler.rename_board(boardid, new_name)


@app.route('/rename_board', methods=['POST', 'GET'])
# @app.route("/rename/<int:boardid>", methods=['POST', 'GET'])
@json_response
def rename_board():
    data = request.get_json()
    response = data_handler.rename_board(data['id'], data['title'])
    return response


@app.route('/rename_status', methods=['POST', 'GET'])
# @app.route("/rename/<int:boardid>", methods=['POST', 'GET'])
@json_response
def rename_status():
    data = request.get_json()
    response = data_handler.rename_status(data['id'], data['title'], data['board_id'], data['target_order'])
    return response


# @app.route("/get-boards")
# @json_response
# def get_boards():
#     """
#     All the boards
#     """
#     return data_handler.get_boards()
#
#
# @app.route("/get-cards/<int:board_id>")
# @json_response
# def get_cards_for_board(board_id: int):
#     """
#     All cards that belongs to a board
#     :param board_id: id of the parent board
#     """
#     return data_handler.get_cards_for_board(board_id)
#
#
@app.route("/create_new_board", methods=['POST', 'GET'])
@json_response
def create_new_board():
    boardTitle = request.get_json()
    data_handler.create_new_board(boardTitle)
    data = data_handler.last_id('boards', 'title', boardTitle)
    data_handler.add_default_statuses_to_board(data['id'])
    return data


@app.route("/add-new-column", methods=['POST', 'GET'])
@json_response
def add_new_column():
    data = request.get_json()
    id_response = data_handler.add_new_column(data['status']['title'], data['status']['order_id'], data['boardID'])
    data['status']['id'] = id_response
    return data


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
