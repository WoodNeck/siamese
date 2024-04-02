import React from "react";

import "./EmbedHeader.css";

const EmbedHeader: React.FC<{
  author: {
    name: string;
    avatar: string;
  };
}> = ({ author }) => {
  return <div className="embed-header-container">
      <img className="embed-header-image" src={author.avatar} />
      <span className="embed-header-name">{author.name}</span>
  </div>
}

export default EmbedHeader;
