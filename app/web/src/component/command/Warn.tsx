import React from "react";

import "./Warn.css"

const Warn: React.FC = ({ children }) => {
  return <div className="nsfw-container">
    ⚠️ {children}
  </div>
};

export default Warn;
