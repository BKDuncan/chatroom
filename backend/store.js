import EVENT from './events.js';

let messageLog = [];
let users = [];
let allSockets;
let counter = 1;

const usernameUnique = (username) => {
    return -1 === users.findIndex((user) =>
        user.name === username
    );
}

const store = {
    setSocket: (newSocket) => { allSockets = newSocket },

    addUser: (userSocket) => {
        // check for cookies with unique username
        let { name, color } = userSocket.handshake.query;
        let username = name;
        let joinMsg = 'has joined the chat.'

        // Check uniqueness
        if (!name || name.length < 1 || !usernameUnique(name)) {
            console.log('New Name. ' + name + ' taken or bad format');
            while (!usernameUnique('User-' + counter)) {
                counter++;
            }
            username = 'User-' + counter;
            counter++;
            color = "#" + Math.random().toString(16).slice(2, 8);
        }
        else {
            joinMsg = 'has reconnected.'
        }

        if (!color) {
            color = "#" + Math.random().toString(16).slice(2, 8);
        }

        const user = {
            id: userSocket.id,
            name: username,
            color: color
        }

        users.push(user);

        const newMessage = {
            username: username,
            time: new Date().toTimeString().split(' ')[0],
            message: joinMsg,
            color: color
        };

        messageLog.push(newMessage);
        userSocket.broadcast.emit(EVENT.ADD_MESSAGE, newMessage);
        userSocket.broadcast.emit(EVENT.ADD_USER, user);

        userSocket.emit(EVENT.INITIALIZE, {
            identity: username,
            messages: messageLog,
            users: users
        });

        console.log(EVENT.ADD_USER + ': ' + user.name + ' ID=' + userSocket.id + '\n');
    },

    removeUser: (userSocket) => {
        console.log(EVENT.REMOVE_USER + ':' + ' ID=' + userSocket.id + '\n');
        const user = users.find((user) => {
            return user.id === userSocket.id;
        });

        if (user) {
            const newMessage = {
                username: user.name,
                time: new Date().toTimeString().split(' ')[0],
                message: 'has left the chat.',
                color: user.color
            };

            messageLog.push(newMessage);
            allSockets.emit(EVENT.ADD_MESSAGE, newMessage);
        }

        users = users.filter(user => user.id !== userSocket.id);
        allSockets.emit(EVENT.REMOVE_USER, userSocket.id);
    },

    pushMessage: (message) => {
        console.log(EVENT.ADD_MESSAGE + message.username + '\n');
        const now = new Date();
        message.time = now.toTimeString().split(' ')[0];
        messageLog.push(message);
        allSockets.emit(EVENT.ADD_MESSAGE, message);
    },

    updateUser: (update, userSocket) => {
        try {
            console.log('Update User ' + update.username);
            let { username, color, newName } = update;

            if (newName !== username) {
                if (newName.length < 1) {
                    userSocket.emit(EVENT.ERROR, { title: 'Invalid nickname', errorMessage: 'A nickname must have at least 1 character' });
                    return;
                }

                if (newName.length > 20) {
                    userSocket.emit(EVENT.ERROR, { title: 'Nickname too long', errorMessage: 'Please choose a nickname under 20 characters' });
                    return;
                }

                if (!usernameUnique(newName)) {
                    userSocket.emit(EVENT.ERROR, { title: 'Invalid nickname', errorMessage: 'the name ' + newName + ' is already taken.' });
                    return;
                }
            }
            else {
                const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if(!isValidColor.test(color)) {
                    userSocket.emit(EVENT.ERROR, { title: 'Invalid color code', errorMessage: 'the code ' + color + ' is not valid. Please use the format "AABBCC".' });
                    return;
                }
            }

            // Perform updates
            for(let user of users) {
                if(user.name === username){
                    user.color = color;
                    user.name = newName;
                }
            }

            for(let msg of messageLog) {
                if(msg.username === username){
                    msg.color = color;
                    msg.username = newName;
                }
            }

            // Forward update to everyone
            allSockets.emit(EVENT.UPDATE_USER_INFO, update);

        } catch (error) {
            console.log(error);
            userSocket.emit(EVENT.ERROR, { title: 'Error', errorMessage: 'An internal error occurred. Please try again later.' });
        }
    },
};

export default store;