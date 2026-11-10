import React from "react";
import "./ChatHeader.css";

const ChatHeader = ({ user }) => {
  // Fallback check to safely handle user whether passed as string or object
  const userName = typeof user === "object" ? user?.name : user || "Select User";
  const userStatus = typeof user === "object" ? (user?.status || "Online") : "Online";
  const avatarLetter = userName.charAt(0).toUpperCase();

  return (
    <div className="chat-header">
      <div className="chat-user-info">
        <div className={`chat-avatar ${userName === "KiD" ? "purple" : "blue"}`}>
          {avatarLetter}
        </div>

        <div className="chat-user-details">
          <h3>{userName}</h3>
          <span className="status-indicator">
            <span className="status-dot"></span>
            {userStatus}
          </span>
        </div>
      </div>

      <div className="chat-header-actions">
        <button className="action-btn" title="Search">🔍</button>
        <button className="action-btn" title="Voice Call">📞</button>
        <button className="action-btn" title="More Options">⋮</button>
      </div>
    </div>
  );
};

export default ChatHeader;