import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';

// Socket IO
import socketIOClient from 'socket.io-client';
import EVENT from './events';

// Components
import ChatLog from './components/ChatLog';
import UserList from './components/UserList';

function App() {
  const [chatState, setChatState] = useState({ messages: [], users: [] });
  const [connect, setConnect] = useState('not connected');
  const [socket, setSocket] = useState();
  const endpoint = '127.0.0.1:8000';
  const cookies = new Cookies();

  const getColor = (username) => {
    let user = chatState.users.find((user) => user.name === username);
    if (user && user.color)
      return user.color;
    else
      return '#000';
  }

  useEffect(() => {
    // Connect to Server
    const savedInfo = cookies.get('user');
    const socket = socketIOClient.connect(endpoint, { query: { ...savedInfo }, transports: ['websocket'] });
    setSocket(socket);
  }, []);

  useEffect(() => {
    if (socket) {
      // Subscribe to server sent events
      socket.on(EVENT.CLIENT_CONNECT, () => {
        setConnect('connected');
      });

      socket.on('disconnect', () => {
        setConnect('disconnected');
        socket.removeAllListeners();
      });

      socket.on(EVENT.INITIALIZE, state => {
        setChatState(state);
        const cookie = {
          name: state.identity,
          color: state.users.find(u => u.name === state.identity).color
        }
        cookies.set('user', cookie, { path: '/', maxAge: 31536000 });
      });

      socket.on(EVENT.ADD_USER, user => {
        let users = chatState.users || [];
        const index = users.findIndex((u) =>
          u.id === user.id
        )
        if (index === -1) {
          users.push(user);
        }
        else {
          users[index] = user;
        }
        setChatState({
          ...chatState,
          users
        });
      });

      socket.on(EVENT.REMOVE_USER, id => {
        let users = chatState.users || [];

        users = users.filter(user => user.id !== id);

        setChatState({
          ...chatState,
          users
        });
      });

      socket.on(EVENT.ADD_MESSAGE, message => {
        let { messages } = chatState || [];
        messages.push(message);

        setChatState({
          ...chatState,
          messages
        });
      });

      socket.on(EVENT.UPDATE_USER_INFO, update => {
        const { username, color, newName } = update;

        let { users, messages, identity } = chatState;

        if (username === identity) {
          // update cookie & identity
          identity = newName;
          const cookie = {
            name: identity,
            color: color
          };
          cookies.set('user', cookie, { path: '/', maxAge: 31536000 });
        }

        // Perform updates
        for (let user of users) {
          if (user.name === username) {
            user.color = color;
            user.name = newName;
          }
        }

        for (let msg of messages) {
          if (msg.username === username) {
            msg.color = color;
            msg.username = newName;
          }
        }

        setChatState({
          ...chatState,
          users,
          messages,
          identity
        });
      });

      socket.on(EVENT.ERROR, error => {
        postError(error.title, error.errorMessage);
      });
    }

    // Cleanup so we don't listen twice for the same event
    return () => {
      if (socket) {
        socket.removeAllListeners();
      }
    };
  }, [chatState, socket]);

  // Post a local error message
  const postError = (title, errorMessage) => {
    const newMessage = {
      username: title + ':',
      time: '--:--:--',
      message: errorMessage,
      color: '#FF0000'
    };

    let { messages } = chatState || [];
    messages.push(newMessage);

    setChatState({
      ...chatState,
      messages
    });
  }

  // Client sent events
  const postMessage = (message) => {
    if (!message || message.length < 1 || !chatState.identity || chatState.identity.length < 1) {
      return;
    }

    let isColorCode = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    let isColorCommand = /^\/nickcolor$/;
    let isNameCommand = /^\/nick$/

    let possibleCommands = message.split(' ');
    if (possibleCommands.length === 2) {
      if (isColorCommand.test(possibleCommands[0].trim())) {
        if (isColorCode.test(possibleCommands[1].trim())) {
          const update = {
            username: chatState.identity,
            color: '#' + possibleCommands[1].trim(),
            newName: chatState.identity
          }

          // send change color request to server
          socket.emit(EVENT.REQUEST_UPDATE_USER, update);
          return;
        }
        else {
          // Invalid color code
          postError('Invalid Slash Command', 'Expected format "/nickcolor AABBCC"');
          return;
        }
      }
      if (isNameCommand.test(possibleCommands[0].trim())) {
        const update = {
          username: chatState.identity,
          color: getColor(chatState.identity),
          newName: possibleCommands[1].trim()
        }

        // send change name request to server
        socket.emit(EVENT.REQUEST_UPDATE_USER, update);
        return;
      }
    }
    else {
      if (isNameCommand.test(possibleCommands[0].trim()) || isColorCommand.test(possibleCommands[0].trim())) {
        postError('Invalid Slash Command', 'Exactly two expected arguments for "/nick" or "/nickcolor"');
        return;
      }
    }

    const newMessage = {
      username: chatState.identity,
      time: '--:--',
      message: message,
      color: getColor(chatState.identity)
    };

    socket.emit(EVENT.ADD_MESSAGE, newMessage);
  }

  return (
    <div className='app'>
      <div className='title-header'>
        <h2 className='title-label'>Username: <span style={{ color: getColor(chatState.identity) }}>{chatState.identity || '-'} </span> <span className='connection-label'>Status: </span><span className='connection-status'>{connect}</span></h2>
      </div>
      <div className='chat-container'>
        <ChatLog
          identity={chatState.identity || ''}
          messages={chatState.messages || []}
          postMessage={postMessage}
        />
        <UserList users={chatState.users || []} />
      </div>
    </div>
  );
}

export default App;
