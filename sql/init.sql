--- crea la tabla de usuarios---
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    password VARCHAR(250)
);
--- crea la tabla de session---
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

--- crea la tabla de restaurants---
CREATE TABLE IF NOT EXISTS restaurants(
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(100),
    city VARCHAR(100)
);


--- crea la tabla de searches---
CREATE TABLE IF NOT EXISTS searches (
    id SERIAL PRIMARY KEY,
    id_user INT,
    seen_city VARCHAR(100),
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
