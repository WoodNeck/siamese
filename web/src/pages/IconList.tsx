import React, { useState, useEffect, useCallback } from "react";
import {
  Link,
  useParams
} from "react-router-dom";
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

import Loading from "../component/Loading";
import * as URL from "../../../src/api/const/url";
import Guild from "../../../src/api/type/Guild";
import Icon from "../../../src/api/type/Icon";
import IconGroup from "../../../src/api/type/IconGroup";
import "./IconList.css";

const IconList: React.FC<{
  guilds: Guild[]
}> = ({ guilds }) => {
  const { guildID, groupID } = useParams<{ guildID: string, groupID?: string }>();
  const [iconGroups, setIconGroups] = useState<IconGroup[] | null>(null);
  const [icons, setIcons] = useState<Icon[] | null>(null);
  const [iconGroup, setIconGroup] = useState<IconGroup | null>(null);

  const guild = guilds.find(guild => guild.id === guildID)!;
  const modal = withReactContent(Swal);

  useEffect(() => {
    if (groupID) {
      Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}${URL.DIRECTORY}?id=${groupID}`, {
          credentials: "include"
        }).then(res => res.json()),
        fetch(`${process.env.REACT_APP_API_URL}${URL.ICONS}?guildID=${guildID}&groupID=${groupID}`, {
          credentials: "include"
        }).then(res => res.json())
      ]).then(([group, images]) => {
          setIconGroups([]);
          setIcons(images as Icon[]);
          setIconGroup(group as IconGroup);
        });
    } else {
      Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}${URL.DIRECTORIES}?id=${guildID}`, {
          credentials: "include"
        }).then(res => res.json()),
        fetch(`${process.env.REACT_APP_API_URL}${URL.ICONS}?guildID=${guildID}`, {
          credentials: "include"
        }).then(res => res.json())
      ]).then(([groups, images]) => {
        setIconGroups(groups as IconGroup[]);
        setIcons(images as Icon[]);
        setIconGroup(null);
      });
    }
  }, [guildID, groupID]);

  const showIcon = useCallback((icon: Icon) => {
    modal.fire({
      imageUrl: icon.url,
      heightAuto: false
    });
  }, [modal]);

  if (!iconGroups || !icons) return <Loading />

  return (
    <>
      <div className="icon-menu-container">
        <div className="icon-menu-left">
          <Link to={groupID ? `/icon/${guildID}` : "/icon"} className="icon-menu-item icon-back-button-container">
            <svg className="icon-menu-icon">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/left-arrow.svg#icon`} />
            </svg>
          </Link>
          <img className="icon-guild-icon" src={ guild.iconURL ? guild.iconURL : `${process.env.PUBLIC_URL}/icons/discord.svg#icon`}></img>
          <div className="icon-guild-title">
            <span>{ guild.name }</span>
            {
              iconGroup &&
              <div className="icon-group-title">
                <span className="icon-group-separator"> / </span>
                <svg className="icon-group-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/folder.svg#icon`} />
                </svg>
                <span>{ iconGroup.name }</span>
              </div>
            }
          </div>
        </div>
        <div className="icon-menu-right">
          <div className="icon-menu-item icon-remove-btn">
            <svg className="icon-remove-icon">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/trash.svg#icon`} />
            </svg>
          </div>
          <div className="icon-menu-item">
            <svg className="icon-upload-icon">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/upload.svg#icon`} />
            </svg>
            <span className="icon-upload-text">업로드</span>
          </div>
        </div>
      </div>
      <div className="icon-item-container">
        <div className="icon-item icon-item-header">
          <input type="checkbox" className="icon-item-checkbox" onClick={e => e.stopPropagation()}></input>
          <div className="icon-item-name header-name">이름</div>
          <div className="icon-item-author">생성자</div>
          <div className="icon-item-count">아이콘 개수</div>
          <div className="icon-item-date">생성일자</div>
        </div>
        <div className="icon-item-separator"></div>
        {
          iconGroups.map(iconGroup => (
            <Link to={`/icon/${guildID}/${iconGroup.id}`} key={iconGroup.id} className="icon-item">
              <input type="checkbox" className="icon-item-checkbox" onClick={e => e.stopPropagation()}></input>
              <div className="icon-item-name">
                <svg className="icon-item-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/folder.svg#icon`} />
                </svg>
                <span>{ iconGroup.name }</span>
              </div>
              <div className="icon-item-author">
                <img className="icon-item-author-icon" src={ iconGroup.author?.avatarURL ?? "" }></img>
                <span className="icon-item-author-tag">{ iconGroup.author?.tag ?? "" }</span>
              </div>
              <div className="icon-item-count">{ iconGroup.iconCount }</div>
              <div className="icon-item-date">{ new Date(iconGroup.createdTimestamp).toLocaleDateString() }</div>
            </Link>
          ))
        }
        {
          icons.map(icon => (
            <div key={icon.id} className="icon-item" onClick={() => showIcon(icon)}>
              <input type="checkbox" className="icon-item-checkbox" onClick={e => e.stopPropagation()}></input>
              <div className="icon-item-name">
                <svg className="icon-item-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/image.svg#icon`} />
                </svg>
                <span>{ icon.name }</span>
              </div>
              <div className="icon-item-author">
                <img className="icon-item-author-icon" src={ icon.author?.avatarURL ?? "" }></img>
                <span className="icon-item-author-tag">{ icon.author?.tag ?? "" }</span>
              </div>
              <div className="icon-item-count"></div>
              <div className="icon-item-date">{ new Date(icon.createdTimestamp).toLocaleDateString() }</div>
            </div>
          ))
        }
      </div>
    </>
  );
}

export default IconList;
