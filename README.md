# TicTacToe

## Overview
This project was created in order to meet the goal of prodcuing a tic-tac-toe game that could be played against a human or 
a computer.  If you select Multiplayer, you will wait in queue until another player starts a Multiplayer game as well.  If you
select Computer, you will play against Hal.  Hal randomly picks his moves based on what squares are currently empty.

## Getting Started
This repo is broken into two distinct projects, `server` and `client`.  To get started using this project, download 
the repository to your machine.  Once downloaded, you can follow these instructions: 

### Server
1) `cd` into `server` and run `npm install`.
2) start `server` by running `npm start`.
3) You will need to create a file called `.env` that sits at the root of the 
`server` project. Here are the fields you will need to add:

```
# This can be any string which will act as a private key used for signing the JWT
JWT_TOKEN_SECRET = ""
# A Postgres user with access to your DB.
PG_USER = ""
# The Postgres host (usually localhost)
PG_HOST = ""
# The name of your DB
PG_DATABASE = ""
# The password associated with the PG_USER above
PG_PASSWORD = ""
# The open Postgres port (usually 5432)
PG_PORT = ""
```

4) You will also need to create a Postgres database containing two tables, `games` and `users`.  Here
are the schemas you can use to create the tables.

    **games**

    ```
    CREATE TABLE games (
        id integer DEFAULT nextval('"gameResults_id_seq"'::regclass) PRIMARY KEY,
        winner integer,
        loser integer,
        timestamp timestamp without time zone
    );

    -- Indices -------------------------------------------------------

    CREATE UNIQUE INDEX "gameResults_pkey" ON games(id int4_ops);
    ```

    **users**

    ```
    -- Table Definition ----------------------------------------------

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email text UNIQUE,
        password text
    );

    -- Indices -------------------------------------------------------

    CREATE UNIQUE INDEX users_pkey ON users(id int4_ops);
    CREATE UNIQUE INDEX users_email_key ON users(email text_ops);
    ```

#### Technologies Used
Node, Apollo/GraphQL, NodeMon, Socket.io, Express, JWT, Postgres (pg), and Dotenv.

### Client
1) `cd` into `client` and run `npm install`.
2) start `client` by running `npm run dev`.
3) The project should open in an active browser [here](http://localhost:8095/).

#### Technologies Used
React, Apollo/GraphQL Client, Socket.io Client, Bootstrap, Formik/Yup, Styled Components, Babel, Webpack, and ES Lint.

## Deployment
As part of this challenge, I created a deployment routine using Circle CI.  It pushes `server` and `client` out to 
an EC2 Instance on an AWS account.  You can see the final project [here](http://tictactoe.nhousestudios.com/).

## Future Improvements
There were a few other features I would have liked to add.

1) A User Timer that gives the opposing user a win if a move isn't made within 30 seconds.
2) MiniMax algorithm to help Hal make better moves.
3) Converting the project to TypeScript.
4) Adding tests using Mocha/Chai.
