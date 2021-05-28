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
    return cursor.fetchone()['id']

@data_conection.connection_handler
def rename_card(cursor: RealDictCursor, id:int, title:str)->list:
    query = f'''
            UPDATE cards
            SET title = '{title}'
            WHERE id = {id}
            returning id;
            '''
    cursor.execute(query, {'title': title, 'id': id})
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
def create_new_card(cursor: RealDictCursor, cardTitle, boardId, statusId):
    query = f"""
            INSERT INTO cards (board_id, title, status_id)
            VALUES ('{boardId}', '{cardTitle}', '{statusId}');"""
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
def last_card(cursor: RealDictCursor, table, key, value) -> list:
    query = '''
            SELECT id, {1}, board_id, status_id
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
def add_new_column(cursor: RealDictCursor, status_title, board):
    subquery = """
            SELECT MAX(order_id)+1 AS next_id
            FROM statuses;"""
    cursor.execute(subquery)
    next_id = cursor.fetchone()['next_id']
    subquery = """
            INSERT INTO statuses (title, order_id)
            VALUES ('{0}', {1})
            ON CONFLICT (title) DO NOTHING
            returning id;""".format(status_title, next_id)
    cursor.execute(subquery)
    status_id = cursor.fetchone()['id']
    query = """
            INSERT INTO board_statuses (board_id, status_id, status_order)
            VALUES ({}, {}, {});""".format(board, status_id, next_id)
    cursor.execute(query)
    return


@data_conection.connection_handler
def delete_data(cursor: RealDictCursor, id:int, table: str) -> list :
    query = sql.SQL('''DELETE FROM {table}
                    WHERE id =%(id)s;
                    ''').format(table=sql.Identifier(f'{table}'))
    cursor.execute(query, {'table': table, 'id': id})


@data_conection.connection_handler
def delete_data_from_board_status(cursor: RealDictCursor, _id):
    query = ('''DELETE FROM board_statuses
                    WHERE board_id = {}''').format(_id)
    cursor.execute(query)




