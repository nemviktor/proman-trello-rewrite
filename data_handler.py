import persistence
import data_conection
from psycopg2.extras import RealDictCursor


@data_conection.connection_handler
def get_statuses_from_table(cursor: RealDictCursor, table) -> list:
    query = '''
    SELECT {0}.id, {0}.title
    FROM {0}
    ORDER BY id;'''.format(table)
    cursor.execute(query)
    return cursor.fetchall()


@data_conection.connection_handler
def get_data_on_cards(cursor: RealDictCursor, table, boardid) -> list:
    query = '''
    SELECT *
    FROM {}
    WHERE board_id = {}
    ORDER BY id;'''.format(table, boardid)
    cursor.execute(query)
    return cursor.fetchall()


@data_conection.connection_handler
def get_data_on_boards(cursor: RealDictCursor, table) -> list:
    query = '''
    SELECT *
    FROM {0}
    ORDER BY id'''.format(table)
    cursor.execute(query)
    return cursor.fetchall()


@data_conection.connection_handler
def get_cards_by_status_id(cursor: RealDictCursor, status_id) -> list:
    query = '''
    SELECT *
    FROM cards
    WHERE status_id = {}'''.format(status_id)
    cursor.execute(query)
    return cursor.fetchall()


@data_conection.connection_handler
def rename_board(cursor: RealDictCursor, boardid, new_name):
    query = f"""
            UPDATE boards
            SET title = '{new_name}'
            WHERE id = {boardid}
            returning id;"""
    cursor.execute(query)
    return dict(cursor.fetchone())

@data_conection.connection_handler
def rename_status(cursor: RealDictCursor, statusid, new_name):
    query = f"""
            UPDATE statuses
            SET title = '{new_name}'
            WHERE id = {statusid}
            returning id;"""
    cursor.execute(query)
    return dict(cursor.fetchone())
# def get_card_status(status_id):
#     """
#     Find the first status matching the given id
#     :param status_id:
#     :return: str
#     """
#     statuses = persistence.get_statuses()
#     return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')
#
#
# def get_boards():
#     """
#     Gather all boards
#     :return:
#     """
#     return persistence.get_boards(force=True)
#
#
# def get_cards_for_board(board_id):
#     persistence.clear_cache()
#     all_cards = persistence.get_cards()
#     matching_cards = []
#     for card in all_cards:
#         if card['board_id'] == str(board_id):
#             card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
#             matching_cards.append(card)
#     return matching_cards
#
#
# def write_data_to_csv(datas):
#     fieldnames= datas[0].keys()
#     # fieldnames = ["id", "title"]
#     persistence._write_csv("data/boards.csv", fieldnames, datas)



