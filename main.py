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


@app.route("/get-statuses")
@json_response
def get_statuses():
    result = data_handler.get_statuses_from_table('statuses')
    return result


# @app.route('/rename', methods=['POST', 'GET'])
@app.route("/rename/<int:boardid>", methods=['POST', 'GET'])
@json_response
def rename(boardid):
    # data = request.get_json()

    if request.method == 'POST':
        new_name = request.form['new-name']
    return data_handler.rename_board(boardid, new_name)


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
# @app.route("/create_new_board", methods=['POST', 'GET'])
# @json_response
# def create_new_board():
#     boardTitle = request.get_json()
#     boards = data_handler.get_boards()
#     boards.append(boardTitle)
#     data_handler.write_data_to_csv(boards)


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
