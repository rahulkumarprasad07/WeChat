import React, { useEffect, useRef } from 'react';
import './MessageArea.css';

const MessageArea = ({ messages, currentUser }) => {
  const messageEndRef = useRef(null);

  // Auto-scroll to the bottom whenever a new message is added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="message-area">
      {messages.length === 0 ? (
        <div className="empty-messages-notice">
          <p>No messages yet. Say hello! 👋</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          // Check if the message was sent by the current user
          const isSent = msg.sender === currentUser || msg.direction === 'out';

          return (
            <div
              key={index}
              className={`message-wrapper ${isSent ? 'sent' : 'received'}`}
            >
              <div className="message-bubble">
                <p className="message-text">{msg.message || msg.text}</p>
                <span className="message-time">
                  {formatTime(msg.timestamp || msg.time)}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageArea;