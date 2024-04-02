import React from "react";

import "./CommandDesc.css";

const CommandDesc: React.FC = ({ children }) => {
  return <div className="command-desc-container">
    { children }
  </div>
}

export default CommandDesc;
