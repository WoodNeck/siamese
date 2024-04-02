import React from "react";

import "./EmbedMenu.css";

const EmbedMenu: React.FC<{
  items: Array<{ emoji: string; count: number }>
}> = ({ items }) => {
  return <div className="embed-menu-container">
    { items.map((item, idx) => <div key={idx} className="embed-menu-item">{item.emoji} {item.count}</div>)}
  </div>
}

export default EmbedMenu;
