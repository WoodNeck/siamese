import React from "react";
import { Link } from "react-router-dom";

import Guild from "../../../src/api/type/Guild";

import "./GuildLink.css";

const GuildLink: React.FC<{
  guild: Guild
}> = ({ guild }) => {
  return <Link to={`/icon/${guild.id}`} className="sidebar-subitem guild-link">
    <img className="guild-link-icon" src={ guild.iconURL ? guild.iconURL : `${process.env.PUBLIC_URL}/icons/discord.svg#icon`}></img>
    { guild.name  }
  </Link>
}

export default GuildLink;
