import persistence
from psycopg2 import sql
import data_conection
from psycopg2.extras import RealDictCursor


@data_conection.connection_handler
def get_statuses_from_table(cursor: RealDictCursor, table1, table2, boardid) -> list:
    query = '''
    SELECT {0}.id, {0}.title, {0}.order_id
    FROM {0}
    JOIN {1} ON {0}.id = {1}.status_id
    WHERE {1}.board_id = {2}
    ORDER BY order_id;'''.format(table1, table2, boardid)
    cursor.execute(query)
    return cursor.fetchall()


@data_conection.connection_handler
def get_data_on_cards(cursor: RealDictCursor, table, boardid) -> list:
    query = '''
    SELECT cards.*, statuses.order_id AS status_order
    FROM {}
    JOIN statuses ON cards.status_id = statuses.id
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
def rename_status(cursor: RealDictCursor, statusid, new_name, target_board, target_order):
    query = f"""
            INSERT INTO statuses (title, order_id)
            VALUES ('{new_name}', {target_order});"""
    cursor.execute(query)
    query = f"""
            SELECT id
            FROM statuses
            WHERE title = '{new_name}';"""
    cursor.execute(query)
    new_statusid = cursor.fetchone()['id']
    query = f"""
            UPDATE board_statuses
            SET status_id = '{new_statusid}'
            WHERE (board_id = {target_board} AND status_order = {target_order});"""
    cursor.execute(query)
    return


@data_conection.connection_handler
def create_new_board(cursor: RealDictCursor, boardTitle):
    query = f"""
            INSERT INTO boards (title)
            VALUES ('{boardTitle}');"""
    cursor.execute(query)
    return

@data_conection.connection_handler
def last_id(cursor: RealDictCursor, table, key, value) -> list:
    query = '''
            SELECT id, {1}
            FROM {0}
            WHERE {1} = '{2}'
            ORDER BY id desc;'''.format(table, key, value)
    cursor.execute(query)
    return cursor.fetchone()


@data_conection.connection_handler
def add_default_statuses_to_board(cursor: RealDictCursor, board_id) :
    query = '''
               INSERT INTO board_statuses (board_id, status_id, status_order)
               VALUES ({0},1,1),({0},2,2),({0},3,3),({0},4,4);'''.format(board_id)
    cursor.execute(query)
    return


@data_conection.connection_handler
def add_new_column(cursor: RealDictCursor, new_status, place, board):
    query = """
            UPDATE statuses
            SET order_id = order_id +1
            WHERE order_id >= {};""".format(place)
    cursor.execute(query)
    query = """
            UPDATE board_statuses
            SET status_order = status_order +1
            WHERE status_order >= {} AND board_id = {};""".format(place, board)
    cursor.execute(query)
    query = """
            INSERT INTO statuses (title, order_id)
            VALUES ('{}', {})
            returning id;""".format(new_status, place)
    cursor.execute(query)
    status_id = cursor.fetchone()['id']
    query = """
            INSERT INTO board_statuses (board_id, status_id, status_order)
            VALUES ({}, {}, {});""".format(board, status_id, place)
    cursor.execute(query)
    return status_id


@data_conection.connection_handler
def delete_data(cursor: RealDictCursor, id:int, table: str) -> list :
    query = sql.SQL('''DELETE FROM {table}
                    WHERE id =%(id)s;
                    ''').format(table=sql.Identifier(f'{table}'))

    cursor.execute(query, {'table': table, 'id': id})


@data_conection.connection_handler
def delete_data_from_board_status(cursor: RealDictCursor, id):
    query =('''DELETE FROM board_statuses
                    WHERE board_id = {}''').format(id)

    cursor.execute(query)
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



