import React, { useEffect, useState } from 'react';
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageArea from "./components/MessageArea";
import MessageInput from "./components/MessageInput";
import LoginPage from "./components/LoginPage";
import heroImg from "./assets/chatImg.png";
import './App.css';
import { ZIM } from 'zego-zim-web';

const App = () => {
  const [zimInstance, setZimInstance] = useState(null);
  const [selectedUser, setSelectedUser] = useState("KiD");
  const [activeChat, setActiveChat] = useState(null);
  
  // Navigation & Auth Flow States
  const [showAuthScreen, setShowAuthScreen] = useState(false); // Triggers LoginPage after "Get Started"
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isZegoConnected, setIsZegoConnected] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  // Environment variables
  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
  const tokenA = import.meta.env.VITE_ZEGO_TOKEN_A;
  const tokenB = import.meta.env.VITE_ZEGO_TOKEN_B;

  // 1. Initialize ZIM SDK Instance
  useEffect(() => {
    if (!appID) return;
    
    ZIM.create({ appID });
    const instance = ZIM.getInstance();
    setZimInstance(instance);

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

    return () => {
      if (instance) instance.destroy();
    };
  }, [appID]);

  // 2. Connect Zego Session for Selected User
  const handleZegoConnect = () => {
    if (!zimInstance) return;

    setLoginLoading(true);
    const userID = selectedUser;
    const loginToken = selectedUser === "KiD" ? tokenA : tokenB;

    zimInstance.login(userID, { userName: selectedUser, token: loginToken })
      .then(() => {
        setIsZegoConnected(true);
        setActiveChat(null);
        setLoginLoading(false);
      })
      .catch((err) => {
        console.error("ZEGOCLOUD Login error:", err);
        setLoginLoading(false);
        alert(`Connection failed (${err.code}): ${err.message}`);
      });
  };

  // 3. Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowAuthScreen(false);
    setIsZegoConnected(false);
    setActiveChat(null);
  };

  // 4. Send Message Handler
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat || !zimInstance) return;

    const messageTextObj = { type: 1, message: messageText.trim() };
    const currentText = messageText.trim();
    setMessageText("");

    zimInstance.sendMessage(messageTextObj, activeChat, 0, { priority: 1 })
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

  // RENDER FLOW:

  // STEP 1: Landing Page (Default screen if not clicking Get Started and not logged in)
  if (!showAuthScreen && !user) {
    return (
      <div className="app-container">
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
                onClick={() => setShowAuthScreen(true)}
              >
                Get Started <span>→</span>
              </button>
              <div className="hero-footer">
                Simple conversations. Meaningful connections.
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // STEP 2: MongoDB Login / Sign Up Page (Triggers after clicking "Get Started")
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(userData) => {
          setUser(userData);
        }}
      />
    );
  }

  // STEP 3: User Selection / Welcome Screen (Shown after successful login before entering chat room)
  if (!isZegoConnected) {
    return (
      <div className="app-container">
        <div className="landing-page">
          <div className="selection-page">
            <div className="selection-card">
              <div className="selection-icon">🗪</div>
              <h1>Welcome to WeChat, {user.username || user.email}!</h1>
              <p className="selection-subtitle">
                Select your chat identity to join the conversation:
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
                onClick={handleZegoConnect}
                disabled={loginLoading}
              >
                {loginLoading ? "Connecting..." : "Continue to Chat →"}
              </button>

              <button className="back-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: Main Chat Dashboard
  return (
    <div className="app-container">
      <div className="chat-dashboard">
        <Sidebar
          currentUser={selectedUser}
          selectedChatUser={activeChat}
          onSelectUser={(userId) => setActiveChat(userId)}
          onLogout={handleLogout}
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
            <div className="empty-chat-state">
              <h2>Welcome, {selectedUser}!</h2>
              <p>Choose a contact from the sidebar on the left to begin your real-time conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;