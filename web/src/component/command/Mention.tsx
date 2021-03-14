import React from "react";

import "./Mention.css"

const Mention: React.FC<{ name: string }> = ({ name }) => {
  return <span className="mention">@{name}</span>
};

export default Mention;
