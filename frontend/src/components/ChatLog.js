import React, { useState, useEffect, useRef } from 'react';
import './ChatLog.css';

const ChatLog = props => {
    const {
        identity,
        messages,
        postMessage
    } = props;

    const [value, setValue] = useState('');
    const endOfMessageLog = useRef(null);

    const handleChange = (event) => {
        setValue(event.target.value);
    }

    const handleSubmit = (event) => {
        postMessage(value);
        setValue('');
        event.preventDefault();
    }

    const scrollToBottom = () => {
        endOfMessageLog.current.scrollIntoView({ block: 'end' });
    }

    useEffect(scrollToBottom, [messages.length]);

    const renderMessages = () => (
        <div className='log-scroll'>
            {messages.map((message, index) => {
                return (
                    <div className='msg-container' key={message.username + ':' + index}>
                        <span className='msg-time'>{message.time}</span>
                        <span className='msg-username' style={{ color: message.color }}>{message.username}</span>
                        <span className={'msg-text' + (message.username === identity ? ' bold' : '')}>{message.message}</span>
                    </div>
                );
            })}
            <div ref={endOfMessageLog} className='scroll-end'/>
        </div>
    );

    return (
        <div className='chat-log'>
            <div className='fixed-log-container'>
                <h2>Chat</h2>
                {renderMessages()}
            </div>
            <form onSubmit={handleSubmit}>
                <input className='chat-input' type='text' value={value} onChange={handleChange} />
            </form>
        </div>
    );
};

export default ChatLog;