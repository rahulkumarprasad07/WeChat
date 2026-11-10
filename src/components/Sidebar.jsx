import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentUser, selectedChatUser, onSelectUser }) => {
  // All potential chat contacts
  const contacts = [
    {
      id: "KiD",
      name: "KiD",
      avatar: "K",
      message: "Hey! What's up?",
      time: "10:30 AM"
    },
    {
      id: "Aditya",
      name: "Aditya",
      avatar: "A",
      message: "Let's catch up!",
      time: "Yesterday"
    }
  ];

  // Show only users other than the logged-in user
  const chatList = contacts.filter((c) => c.id !== currentUser);

  return (
    <div className="sidebar">
      {/* Profile Section */}
      <div className="sidebar-header">
        <h2>WeChat<span>.</span></h2>
        <div className="profile-avatar">{currentUser.charAt(0).toUpperCase()}</div>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search conversations..."
        />
      </div>

      {/* Conversations */}
      <div className="conversation-section">
        <h4>MESSAGES</h4>

        {chatList.map((user) => (
          <div
            key={user.id}
            className={`conversation ${selectedChatUser === user.id ? "active" : ""}`}
            onClick={() => onSelectUser(user.id)}
          >
            <div className={`conversation-avatar ${user.id === "KiD" ? "purple" : "blue"}`}>
              {user.avatar}
            </div>

            <div className="conversation-info">
              <h3>{user.name}</h3>
              <p>{user.message}</p>
            </div>

            <span className="conversation-time">
              {user.time}
            </span>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        Logged in as <strong>{currentUser}</strong>
      </div>
    </div>
  );
};

export default Sidebar;