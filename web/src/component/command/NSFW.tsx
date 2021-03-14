import React from "react";

import "./NSFW.css"

const NSFW: React.FC = ({ children }) => {
  return <div className="nsfw-container">
    ⚠️ {children}
  </div>
};

export default NSFW;
