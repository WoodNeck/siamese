/* eslint-disable no-script-url */
import React from "react";
import { useSelector } from "react-redux";
import {
  Link
} from "react-router-dom";
import ReactTooltip from "react-tooltip";

import { RootState } from "../redux/reducers";

import Guild from "~/api/type/Guild";

import "./GuildList.css";

const GuildList: React.FC<{
  to: string;
  subtitle: string;
  taskName: string;
  hasPermission: (guild: Guild) => boolean;
}> = ({ to, subtitle, taskName, hasPermission }) => {
  const guilds = useSelector((state: RootState) => state.guilds);

  return (
    <div className="guild-container">
      <div className="guild-header">
        <div className="guild-header-text">
          <span>서버 목록</span>
        </div>
      </div>
      <div className="guild-subtitle">{subtitle}</div>
      {
        guilds.map(guild => (
          <div key={guild.id}>
            <div className="guild-separator"></div>
            <Link to={`/${to}/${guild.id}`} className="guild-item">
              <img className="guild-icon" src={ guild.iconURL ? guild.iconURL : `${process.env.PUBLIC_URL}/icons/discord.svg#icon`}></img>
              <div className="guild-name">{ guild.name }</div>
              {guild.hasSiamese && <img className="guild-has-siamese" src={`${process.env.PUBLIC_URL}/logo20.png`} /> }
              <svg className={`guild-approved-icon ${hasPermission(guild) ? "yes" : "no"}`} data-tip data-for={`guild-permission-tooltip-${guild.id}`}>
                <use xlinkHref={`${process.env.PUBLIC_URL}/icons/${hasPermission(guild) ? "approve" : "cancel"}.svg#icon`} />
              </svg>
              <ReactTooltip id={`guild-permission-tooltip-${guild.id}`} place="right" type="dark" effect="solid">
                <span>{ hasPermission(guild) ? `${taskName}이 가능합니다` : `${taskName} 권한이 없습니다`}</span>
              </ReactTooltip>
              <div className="guild-enter-icon-container">
                <svg className="guild-enter-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/right-arrow.svg#icon`} />
                </svg>
              </div>
            </Link>
          </div>
        ))
      }
    </div>
  );
};

export default GuildList;
