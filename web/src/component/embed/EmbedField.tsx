import React from "react";

import "./EmbedField.css";

const EmbedField: React.FC<{
  title: string;
  text: string | React.ReactNode;
}> = ({ title, text }) => {
  return <div className="embed-field-container">
    <span className="embed-field-title">{title}</span>
    <span className="embed-field-text">{text}</span>
  </div>
}

export default EmbedField;
