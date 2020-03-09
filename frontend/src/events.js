const EVENT = {
    // User to Server
    JOIN: 'connection',
    CLIENT_CONNECT: 'connect',
    LEAVE: 'disconnect',
    REQUEST_UPDATE_USER: 'update_user_request',
    
    // Server to Individual User
    INITIALIZE: 'initialize',
    ERROR: 'errorMsg',

    // Server Broadcast
    ADD_MESSAGE: 'message',
    ADD_USER: 'user',
    REMOVE_USER: 'remove_user',
    UPDATE_USER_INFO: 'set_user_info',
};

export default EVENT;