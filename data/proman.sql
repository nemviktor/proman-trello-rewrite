ALTER TABLE IF EXISTS ONLY cards DROP CONSTRAINT IF EXISTS fk_card_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY cards DROP CONSTRAINT IF EXISTS fk_card_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY statuses DROP CONSTRAINT IF EXISTS fk_status_board_id CASCADE;

ALTER TABLE IF EXISTS ONLY session DROP CONSTRAINT IF EXISTS fk_user_id CASCADE;

DROP TABLE IF EXISTS boards;
CREATE TABLE boards (
    id serial NOT NULL PRIMARY KEY,
    title text DEFAULT 'Undefined',
    owner integer
);

DROP TABLE IF EXISTS statuses;
CREATE TABLE statuses (
    id serial NOT NULL PRIMARY KEY,
    title text UNIQUE DEFAULT 'Undefined',
    order_id INTEGER NOT NULL
);

DROP TABLE IF EXISTS cards;
CREATE TABLE cards (
    id serial NOT NULL PRIMARY KEY,
    board_id integer NOT NULL,
    title text DEFAULT 'Undefined',
    status_id integer NOT NULL,
    "order" serial NOT NULL,
    board_statuses_id integer not null
);

DROP TABLE IF EXISTS board_statuses;
CREATE TABLE board_statuses (
  id serial NOT NULL PRIMARY KEY,
  board_id INTEGER,
  status_id INTEGER,
  status_order INTEGER
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id serial NOT NULL PRIMARY KEY,
  user_name VARCHAR,
  password VARCHAR
);

DROP TABLE IF EXISTS session;
CREATE TABLE session (
  id serial NOT NULL PRIMARY KEY,
  session_id VARCHAR,
  user_id INTEGER,
  time TIME
);
ALTER TABLE session
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


ALTER TABLE cards
ADD CONSTRAINT fk_board_statuses_id FOREIGN KEY (board_statuses_id) REFERENCES board_statuses(id) ON DELETE CASCADE;


INSERT INTO board_statuses (board_id, status_id, status_order)
            VALUES (1,1,1),(1,2,2),(1,3,3),(1,4,4),(2,1,1),(2,2,2),(2,3,3),(2,4,4),(3,1,1),(3,2,2),(3,3,3),(3,4,4),(4,1,1),(4,2,2),(4,3,3),(4,4,4);

INSERT INTO boards (title, owner) VALUES ('Board 1', 0), ('Board 2', 0), ('Board 3', 1), ('Board 4', 1);

INSERT INTO statuses (title, order_id) VALUES ('new',1), ('in progress',2),  ('testing',3) ,('done',4);

INSERT INTO cards (board_id, title, status_id, "order", board_statuses_id) VALUES (1, 'new cad 1', 1, 0, 1),
                         (1, 'new card 2', 1, 1, 1),
                         (1, 'in progress card', 2, 0, 2),
                         (1, 'planning', 3, 0, 3),
                         (1, 'done card 1', 4, 0, 4),
                         (1, 'done card 2', 4, 1, 4),
                         (2, 'new card 1', 1, 0, 5),
                         (2, 'new card 2', 1, 1, 5),
                         (2, 'in progress card', 2, 0, 2),
                         (2, 'planning', 3, 0, 7),
                         (2, 'done card 1', 4, 0, 8),
                         (2, 'done card 2', 4, 1, 8),
                         (3, 'new card', 1, 0, 9),
                         (4, 'new card', 1, 0, 13);




INSERT INTO users (user_name, password)
VALUES ('Test', '$2b$12$TxMw5WGZ7m1Gj3Qxtd6uEO251HuW2X94qwdr/vcYXdI0wo/WgpfxK');