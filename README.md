# chatroom

This is a chatroom application developed with node.js and react.js.

### How to run

#### Setup

- Install `node 12.x.x` and the latest `yarn`
- Clone the repository

#### Backend

- `cd` into the `backend` folder and run `yarn install` to obtain all the dependencies
- enter `yarn start` to run the node backend

#### Frontend

- `cd` into the `frontend` folder and run `yarn install` to obtain all the dependencies
- enter `yarn start` to run the react frontend
- open a chrome or firefox browser at [localhost:3000](http://localhost:3000)


### Features

- Each user has a username and color that are persistant across all clients (everyone can see your color if it changes)
- `/nick [USERNAME]` command to change your username in the chat
- `/nickcolor [ABC or AABBCC]` command to change your username color in the chat (accepts 3 or 6 hex characters)
- Username and color are saved in cookies that persist after closing the app
- Chat users are given a private error message if they enter a command incorrectly
- Automatic scrolling when new messages are entered
- Old chat messages are stored in memory by the server so everyone has a record of old messages
- The system announces when users enter or leave the chat