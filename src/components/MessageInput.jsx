import React from 'react';
import './MessageInput.css';

const MessageInput = ({ messageText, setMessageText, onSendMessage }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="message-input-container">
      <div className="input-wrapper">
        <button className="attachment-btn" title="Attach file">
          📎
        </button>
        <input
          type="text"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`send-btn ${messageText.trim() ? 'active' : ''}`}
          onClick={onSendMessage}
          disabled={!messageText.trim()}
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default MessageInput;