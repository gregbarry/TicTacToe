import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

import routes from '-/routes';

const PORT = process.env.PORT || 4000;
const app = express();

app.use(routes);

const server = http.createServer(app);
const io = socketIo(server);

let interval;

const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit('FromAPI', response);
};

io.on('connection', socket => {
    console.log('New client connected');

    if (interval) {
        clearInterval(interval);
    }

    interval = setInterval(() => getApiAndEmit(socket), 1000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
