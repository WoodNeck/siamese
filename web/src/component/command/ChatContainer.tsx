import React from "react";

import "./ChatContainer.css";

const ChatContainer: React.FC = ({ children }) => {
  return <div className="bubblechat-container">
    { children }
  </div>
}

export default ChatContainer;
