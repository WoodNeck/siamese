import React from "react";

import "./EmbedFooter.css";

const EmbedFooter: React.FC<{
  image: string;
  text: string;
}> = ({ image, text }) => {
  return <div className="embed-footer-container">
      <img className="embed-footer-image" src={image} />
      <span className="embed-footer-text">{text}</span>
  </div>
}

export default EmbedFooter;
