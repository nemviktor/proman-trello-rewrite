ALTER TABLE IF EXISTS ONLY cards DROP CONSTRAINT IF EXISTS fk_card_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY cards DROP CONSTRAINT IF EXISTS fk_card_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY statuses DROP CONSTRAINT IF EXISTS fk_status_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY users DROP CONSTRAINT IF EXISTS fk_user_id CASCADE;

DROP TABLE IF EXISTS boards;
CREATE TABLE boards (
    id serial NOT NULL PRIMARY KEY,
    title text DEFAULT 'Undefined',
    user_id integer
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
    "order" serial NOT NULL
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

ALTER TABLE ONLY boards
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ;



INSERT INTO board_statuses (board_id, status_id, status_order)
            VALUES (1,1,1),(1,2,2),(1,3,3),(1,4,4),(2,1,1),(2,2,2),(2,3,3),(2,4,4);

INSERT INTO boards (title, user_id) VALUES ('Board 1'), ('Board 2', 2);

INSERT INTO statuses (title, order_id) VALUES ('new',1), ('in progress',2),  ('testing',3) ,('done',4);

INSERT INTO cards (board_id, title, status_id, "order") VALUES (1, 'new cad 1', 1, 0),
                         (1, 'new card 2', 1, 1),
                         (1, 'in progress card', 2, 0),
                         (1, 'planning', 3, 0),
                         (1, 'done card 1', 4, 0),
                         (1, 'done card 2', 4, 1),
                         (2, 'new card 1', 1, 0),
                         (2, 'new card 2', 1, 1),
                         (2, 'in progress card', 2, 0),
                         (2, 'planning', 3, 0),
                         (2, 'done card 1', 4, 0),
                         (2, 'done card 2', 4, 1);

INSERT INTO users
VALUES (1, 'Test', '$2b$12$NEEhTiRuJIPZVXPcGeCCguw3I8O9atD8s1oeLtisjef/8wTHtZIrS');