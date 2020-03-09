import express from 'express';
import http from 'http';
import cors from 'cors';
import httpRouter from './routes/httpRouter.js';
import socketIo from 'socket.io';
import store from './store.js';
import EVENT from './events.js'; 

// creating an express server instance
const app = express();
const server = http.createServer(app);

// getting the port from environment variable
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({limit: '2MB'}));
app.use('/', httpRouter);

const io = socketIo(server);
store.setSocket(io);

io.on(EVENT.JOIN, socket => {
    store.addUser(socket);
    socket.on(EVENT.LEAVE, () => {
        store.removeUser(socket);
    });

    socket.on(EVENT.ADD_MESSAGE, message => {
        store.pushMessage(message);
    });

    socket.on(EVENT.REQUEST_UPDATE_USER, update => {
        store.updateUser(update, socket);
    });
});

server.listen(port, () => {
    console.log('Server is running on port:', port);
});