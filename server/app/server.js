import {sample} from 'lodash';
import {ApolloServer} from 'apollo-server-express';
import logger from 'bristol';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import {nanoid} from 'nanoid';
import palin from 'palin';
import url from 'url';

// This needs to stay here to ensure config is imported first
/* eslint no-unused-vars: "off" */
import {config} from './config';
import graphqlSchema from './graphql/schema/';
import {checkForWinner, getEmptySquares, sleep, updatePlayers} from './utils';

logger.addTarget('console').withFormatter(palin);
logger.info('NestGenesis init');

const PORT = process.env.PORT || 4000;
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const allowedHosts = ['localhost'];

const start = async() => {
    const app = express();
    app.use(compression());
    app.use(cors({
        origin: (origin, callback) => {
            const {hostname} = url.parse(origin || '') || {};
            if (isDev || !origin || allowedHosts.includes(hostname)) {
                callback(null, true);
            } else {
                logger.error(`Attempted CORS access from origin: ${origin}`);
            }
        },
        credentials: true
    }));

    app.set('trust proxy', true);

    const server = http.createServer(app);
    const io = socketIo(server);
    const apollo = new ApolloServer({schema: graphqlSchema});

    apollo.applyMiddleware({
        app,
        cors: {
            credentials: true,
            origin: 'http://localhost:8095'
        }
    });

    const rooms = new Map();
    const DIMENSIONS = 3;
    const fillBoard = () => {
        return new Array(DIMENSIONS ** 2).fill(null);
    };

    const createRoom = (gameInfo = {}) => {
        const {email, gameType} = gameInfo;
        let newRoom = nanoid();

        while (rooms.has(newRoom)){
            newRoom = nanoid()();
        }

        const players = [{
            active: true,
            type: 'human',
            name: email,
            piece: 'X'
        }];

        if (gameType === 'computer') {
            players.push({
                active: false,
                type: 'computer',
                name: 'Hal',
                piece: 'O'
            });
        }

        rooms.set(newRoom, {
            gameType,
            roomId: newRoom,
            players,
            grid: fillBoard()
        });

        return newRoom;
    };

    const handleComputerMove = async roomId => {
        const room = rooms.get(roomId);
        const {grid, players = []} = room;
        const computer = players.find(player => player.type === 'computer');
        const {piece} = computer;
        const emptySquares = getEmptySquares(grid);
        // TODO: Implement minimax 50% of the time to make computer picks smarter
        const computerPick = sample(emptySquares);
        const gridClone = [...grid];
        gridClone[computerPick] = piece;

        const gameResults = checkForWinner(gridClone);
        const updatedPlayers = updatePlayers(players);

        await sleep(1250);

        rooms.set(roomId, {
            ...room,
            grid: gridClone,
            players: updatedPlayers,
            ...gameResults && {
                ...gameResults
            }
        });
    };

    const handleMove = (moveInfo = {}) => {
        const {roomId, player, square} = moveInfo;
        const {piece} = player;
        const room = rooms.get(roomId);
        const {grid, players = []} = room;
        const gridClone = [...grid];
        gridClone[square] = piece;

        const gameResults = checkForWinner(gridClone);

        if (gameResults) {
            // TODO: Update database with win information
        }

        const updatedPlayers = updatePlayers(players);

        rooms.set(roomId, {
            ...room,
            grid: gridClone,
            players: updatedPlayers,
            ...gameResults && {
                ...gameResults
            }
        });
    };

    io.on('connection', socket => {
        logger.info('New client connected');

        socket.on('startGame', gameInfo => {
            const {email, gameType} = gameInfo;
            const {size} = rooms;
            let needsTable = true;

            if (size && gameType === 'multiplayer') {
                for (const [roomId, roomObj] of rooms) {
                    const {players = [], name: currentPlayer, ...theRest} = roomObj;

                    if (players.length === 1 && email !== currentPlayer) {
                        rooms.set(roomId, {
                            ...theRest,
                            players: [...players, {
                                active: false,
                                type: 'human',
                                name: email,
                                piece: 'O'
                            }]
                        });

                        logger.info(`Emitting 'joiningRoom' with room: ${roomId}`);
                        socket.join(roomId);
                        io.to(roomId).emit('joiningRoom', rooms.get(roomId));
                        needsTable = false;
                        break;
                    }
                }
            }

            if (needsTable) {
                const room = createRoom(gameInfo);
                logger.info(`Emitting 'joiningRoom' with room: ${room}`);
                socket.join(room);
                socket.emit('joiningRoom', rooms.get(room));
            }
        });

        socket.on('move', async moveInfo => {
            const {roomId} = moveInfo;
            handleMove(moveInfo);
            const room = rooms.get(roomId);
            const {gameType, winner} = room;
            const gameOver = !!winner;
            io.to(roomId).emit('moveHandled', room);

            if (gameType === 'computer' && !gameOver) {
                await handleComputerMove(roomId);
                const updatedRoom = rooms.get(roomId);
                socket.emit('moveHandled', updatedRoom);
            }
        });

        socket.on('disconnect', e => {
            logger.info('Client disconnected');
            // TODO: emit event letting other player know opponent disconneted
        });
    });

    server.listen(PORT, () => {
        logger.info(`Listening on port ${PORT}`);
    });
};

start();