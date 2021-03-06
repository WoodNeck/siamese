import React from "react";
import {
  Link
} from "react-router-dom";

import Guild from "../../../src/api/type/Guild";
import "./GuildList.css";

const GuildList: React.FC<{
  guilds: Guild[];
}> = ({ guilds }) => {
  return (
    <div className="guild-container">
      <div className="guild-header">
        <div className="guild-header-text">
          <span>서버 목록</span>
        </div>
      </div>
      <div className="guild-subtitle">
        아이콘을 편집할 서버를 선택해주세요
      </div>
      {
        guilds.map(guild => (
          <div key={guild.id}>
            <div className="guild-separator"></div>
            <Link to={`/icon/${guild.id}`} className="guild-item">
              <img className="guild-icon" src={ guild.iconURL ? guild.iconURL : `${process.env.PUBLIC_URL}/icons/discord.svg#icon`}></img>
              <div className="guild-name">{ guild.name }</div>
              <svg className={`guild-approved-icon ${guild.hasPermission ? "yes" : "no"}`}>
                <use xlinkHref={`${process.env.PUBLIC_URL}/icons/${guild.hasPermission ? "approve" : "cancel"}.svg#icon`} />
              </svg>
              <div className="guild-enter-icon-container">
                <svg className="guild-enter-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/right-arrow.svg#icon`} />
                </svg>
              </div>
            </Link>
          </div>
        ))
      }
      <div className="guild-footer">
        - 서버가 표시되지 않나요? 샴고양이를 사용하는 서버에서 아무 메시지나 보낸 다음 다시 확인해보세요!
      </div>
    </div>
  );
};

export default GuildList;
