import React from 'react';
import './ChatMessage.css';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { text, sender } = message;
  
  return (
    <div className={`message ${sender}`}>
      <div className="message-content">
        {text}
      </div>
    </div>
  );
};

export default ChatMessage; 