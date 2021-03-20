import React, { useCallback } from "react";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { RootState } from "../redux/reducers";
import * as URL from "~/api/const/url";
import Guild from "~/api/type/Guild";
import IconGroup from "~/api/type/IconGroup";
import Icon from "~/api/type/Icon";

import "./SettingHeader.css";

const SettingHeader: React.FC<{
  guild: Guild;
}> = ({ guild }) => {
  return <div className="icon-menu-container">
    <div className="icon-menu-left">
      <Link to="/setting" className="icon-menu-item icon-back-button-container">
        <svg className="icon-arrow-icon">
          <use xlinkHref={`${process.env.PUBLIC_URL}/icons/left-arrow.svg#icon`} />
        </svg>
      </Link>
      <img className="icon-guild-icon" src={ guild.iconURL ? guild.iconURL : `${process.env.PUBLIC_URL}/icons/discord.svg#icon`}></img>
      <div className="icon-guild-title">
        <span>{ guild.name }</span>
      </div>
    </div>
    <div className="icon-menu-right">
      <div className="icon-menu-item">
          <svg className="icon-upload-icon">
            <use xlinkHref={`${process.env.PUBLIC_URL}/icons/approve.svg#icon`} />
          </svg>
          <span className="icon-upload-text">저장하기</span>
        </div>
    </div>
  </div>
}

export default SettingHeader;
