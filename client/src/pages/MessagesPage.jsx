import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MessagesPage.css';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        'http://localhost:5000/api/messages/conversations',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `http://localhost:5000/api/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const conversation = conversations.find(c => c._id === selectedConversation);
      const receiverId = conversation.lastMessage.senderId._id === currentUserId
        ? conversation.lastMessage.receiverId._id
        : conversation.lastMessage.senderId._id;

      await axios.post(
        'http://localhost:5000/api/messages',
        {
          conversationId: selectedConversation,
          receiverId,
          message: newMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="messages-page">
      <div className="conversations-sidebar">
        <h2>Messages</h2>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p className="no-conversations">No conversations yet</p>
          ) : (
            conversations.map(conv => {
              const otherUser = conv.lastMessage.senderId._id === currentUserId
                ? conv.lastMessage.receiverId
                : conv.lastMessage.senderId;

              return (
                <div
                  key={conv._id}
                  className={`conversation-item ${selectedConversation === conv._id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv._id)}
                >
                  <div className="conversation-avatar">
                    {otherUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="conversation-info">
                    <h4>{otherUser.name}</h4>
                    <p>{conv.lastMessage.message.substring(0, 50)}...</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="messages-main">
        {selectedConversation ? (
          <>
            <div className="messages-list">
              {messages.map(msg => (
                <div
                  key={msg._id}
                  className={`message ${msg.senderId._id === currentUserId ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    <p>{msg.message}</p>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form className="message-input-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <h3>Select a conversation to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
