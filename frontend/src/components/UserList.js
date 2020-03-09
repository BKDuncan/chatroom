import React from 'react';
import './UserList.css';

const UserList = props => {
    const {
        users
    } = props;

    const renderUsers = () => (
        <>
        {users.map( user => {
            return <div style={{color: user.color}} key={user.name}>{user.name}</div>
        })}
        </>
    );

    return (
        <div className='user-list'>
            <h2>Participants</h2>
            {renderUsers()}
        </div>
    );
};

export default UserList;