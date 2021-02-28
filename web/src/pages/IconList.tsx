import React, { useState, useEffect } from "react";
import {
  Link,
  useParams
} from "react-router-dom";

import Loading from "../component/Loading";
import Icon from "../type/Icon";
import IconGroup from "../type/IconGroup";
import "./IconList.css";

const IconList: React.FC = () => {
  let { guildID } = useParams<{ guildID: string }>();
  const [iconGroups, setIconGroups] = useState<IconGroup[] | null>(null);
  const [icons, setIcons] = useState<Icon[] | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/directories?id=${guildID}`, {
        credentials: "include"
      }).then(res => res.json()),
      fetch(`${process.env.REACT_APP_API_URL}/icons?id=${guildID}`, {
        credentials: "include"
      }).then(res => res.json())
    ]).then(([groups, images]) => {
      setIconGroups(groups as IconGroup[]);
      setIcons(images as Icon[]);
    });
  }, [guildID]);

  if (!iconGroups || !icons) return <Loading />

  return (
    <>
      <div className="icon-menu-container">
        <div className="icon-menu-item">
          <svg className="icon-menu-icon">
            <use xlinkHref={`${process.env.PUBLIC_URL}/icons/upload.svg#icon`} />
          </svg>
          <span>업로드</span>
        </div>
      </div>
      <div className="icon-item-container">
        <Link to="/icon" className="icon-item icon-back-button">
          <svg>
            <use xlinkHref={`${process.env.PUBLIC_URL}/icons/left-arrow.svg#icon`} />
          </svg>
        </Link>
        {
          iconGroups.map(iconGroup => (
            <div key={iconGroup._id} className="icon-item icon-card">
              <div>📁</div>
              <span>{ iconGroup.name }</span>
            </div>
          ))
        }
        {
          icons.map(icon => (
            <div key={icon._id} className="icon-item icon-card">
              <img className="icon-img" src={icon.url} />
              <span>{icon.name}</span>
            </div>
          ))
        }
      </div>
    </>
  );
}

export default IconList;
