import React, { useEffect, useState } from 'react';
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageArea from "./components/MessageArea";
import MessageInput from "./components/MessageInput";
import heroImg from "./assets/chatImg.png";
import './App.css';
import { ZIM } from 'zego-zim-web';

const App = () => {
  const [zimInstance, setZimInstance] = useState(null);
  const [selectedUser, setSelectedUser] = useState("KiD");
  const [activeChat, setActiveChat] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  // Load environment variables
  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
  const tokenA = import.meta.env.VITE_ZEGO_TOKEN_A;
  const tokenB = import.meta.env.VITE_ZEGO_TOKEN_B;

  // 1. Initialize ZIM SDK Instance
  useEffect(() => {
    ZIM.create({ appID });
    const instance = ZIM.getInstance();
    setZimInstance(instance);

    // Event Listener: Real-time Message Reception
    instance.on('messageReceived', function (zim, { messageList }) {
      const incomingMessages = messageList.map(msg => ({
        sender: msg.senderUserID,
        text: msg.message,
        timestamp: msg.timestamp
      }));

      setMessages(prev => [...prev, ...incomingMessages]);
    });

    instance.on('error', function (zim, errorInfo) {
      console.error('ZIM Error:', errorInfo.code, errorInfo.message);
    });

    instance.on('tokenWillExpire', function (zim, { second }) {
      const activeToken = selectedUser === "KiD" ? tokenA : tokenB;
      zim.renewToken(activeToken)
        .then(() => console.log("Token renewed successfully"))
        .catch((err) => console.error("Token renewal failed:", err));
    });

    return () => {
      instance.destroy();
    };
  }, []);

  // 2. Login Handler
  const handleLogin = () => {
    if (!zimInstance) {
      console.error("ZIM Instance not initialized yet");
      return;
    }

    setLoginLoading(true);

    const userID = selectedUser;
    const loginToken = selectedUser === "KiD" ? tokenA : tokenB;

    const config = {
      userName: selectedUser,
      token: loginToken
    };

    console.log("Attempting ZIM Login with:", userID);

    zimInstance.login(userID, config)
      .then(() => {
        setIsLoggedIn(true);
        setActiveChat(null);
        setLoginLoading(false);
        console.log(`Successfully logged in as ${selectedUser}`);
      })
      .catch((err) => {
        console.error("ZEGOCLOUD Login error:", err);
        setLoginLoading(false);
        alert(`Login failed (${err.code}): ${err.message}`);
      });
  };

  // 3. Send Real-time Message Handler
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat || !zimInstance) return;

    const toConversationID = activeChat;
    const conversationType = 0; // Peer-to-peer chat
    const config = { priority: 1 };

    const messageTextObj = {
      type: 1,
      message: messageText.trim()
    };

    const currentText = messageText.trim();
    setMessageText("");

    zimInstance.sendMessage(messageTextObj, toConversationID, conversationType, config)
      .then(({ message }) => {
        const sentMsg = {
          sender: selectedUser,
          text: message.message,
          timestamp: message.timestamp || Date.now()
        };
        setMessages((prev) => [...prev, sentMsg]);
      })
      .catch((err) => {
        console.error("Failed to send message:", err);
        setMessageText(currentText);
      });
  };

  return (
    <div className="app-container">
      {!showUserSelection ? (
        /* LANDING PAGE */
        <div className="landing-page">
          <nav className="navbar">
            <div className="logo">
              <span className="logo-icon">✦</span>
              WeChat
            </div>
            <div className="nav-right">
              <span className="nav-tagline">A little closer, every day.</span>
            </div>
          </nav>

          <main className="hero">
            <div className="hero-content">
              <div className="hero-badge">✨ &nbsp; YOUR SPACE TO CONNECT</div>
              <h1>
                Every conversation<br />
                starts <span>somewhere.</span>
              </h1>
              <p>
                A simple space to connect, share thoughts<br />
                and stay close to the people who matter.
              </p>
              <button
                className="get-started"
                onClick={() => setShowUserSelection(true)}
              >
                Get Started <span>→</span>
              </button>
              <div className="hero-footer">
                Simple conversations. Meaningful connections.
              </div>
            </div>
          </main>
        </div>
      ) : !isLoggedIn ? (
        /* USER SELECTION PAGE */
        <div className="landing-page">
          <div className="selection-page">
            <div className="selection-card">
              <div className="selection-icon">🗪</div>
              <h1>Welcome to WeChat</h1>
              <p className="selection-subtitle">
                Who's joining the conversation today?
              </p>

              <div className="user-options">
                <div
                  className={`user-card ${selectedUser === "KiD" ? "active" : ""}`}
                  onClick={() => setSelectedUser("KiD")}
                >
                  <div className="user-avatar kid-avatar">K</div>
                  <h3>KiD</h3>
                  <p>Ready to connect</p>
                  {selectedUser === "KiD" && <span className="selected-check">✓</span>}
                </div>

                <div
                  className={`user-card ${selectedUser === "Aditya" ? "active" : ""}`}
                  onClick={() => setSelectedUser("Aditya")}
                >
                  <div className="user-avatar aditya-avatar">A</div>
                  <h3>Aditya</h3>
                  <p>Ready to connect</p>
                  {selectedUser === "Aditya" && <span className="selected-check">✓</span>}
                </div>
              </div>

              <button 
                className="continue-btn" 
                onClick={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading ? "Connecting..." : "Continue →"}
              </button>

              <button
                className="back-btn"
                onClick={() => setShowUserSelection(false)}
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN DASHBOARD UI */
        <div className="chat-dashboard">
          <Sidebar
            currentUser={selectedUser}
            selectedChatUser={activeChat}
            onSelectUser={(userId) => setActiveChat(userId)}
          />

          <div className="main-chat-window">
            {activeChat ? (
              <>
                <ChatHeader user={activeChat} />
                <MessageArea messages={messages} currentUser={selectedUser} />
                <MessageInput
                  messageText={messageText}
                  setMessageText={setMessageText}
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              /* EMPTY PLACEHOLDER SCREEN */
              <div className="empty-chat-state">
                
                <h2>Select a chat to start messaging</h2>
                <p>Choose a contact from the sidebar on the left to begin your real-time conversation.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;