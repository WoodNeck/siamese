import React from "react";

import "./ChatBubble.css";

const ChatBubble: React.FC<{
  author?: {
    name: string;
    avatar: string;
  };
  position: "left" | "right";
}> = ({ author, position, children }) => {
  return <div className={`chat-bubble-container ${position}`}>
    {author &&
      <div className="chat-bubble-author">
        <img className="chat-bubble-author-image" src={author.avatar} />
        <span className="chat-bubble-author-name">{author.name}</span>
      </div>
    }
    <div className="chat-bubble">
      { children }
    </div>
  </div>
}

export default ChatBubble;
