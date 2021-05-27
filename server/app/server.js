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
import graphqlSchema from '-/graphql/schema';

logger.addTarget('console').withFormatter(palin);
logger.info('NestGenesis init');

const PORT = process.env.PORT || 4000;
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const allowedHosts = ['localhost'];
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

const createRoom = () => {
    let newRoom = nanoid();

    // This is probably over kill. The chance of nanoid generating
    // the same ID is infinitesimal
    while (rooms.has(newRoom)){
        newRoom = nanoid()();
    }

    rooms.set(newRoom, {
        roomId: newRoom,
        players:[],
        board: null
    });

    return newRoom;
};

io.on('connection', socket => {
    logger.info('New client connected');

    socket.on('newGame', () => {
        const room = createRoom();
        logger.info(`Emitting 'newGameCreated' with room: ${room}`);
        socket.emit('newGameCreated', room);
    });

    socket.on('joining', ({room}) => {
        const foundRoom = rooms.has(room);
        const joinMessage = foundRoom ? 'joinConfirmed' : 'errorMessage: Room not found';
        logger.info(`Emitting: ${joinMessage}`);
        socket.emit(joinMessage);
    });


    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

server.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
});
