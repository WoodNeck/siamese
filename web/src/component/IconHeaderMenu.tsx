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

import "./IconHeaderMenu.css";

const IconHeaderMenu: React.FC<{
  icons: Icon[] | null;
  iconGroups: IconGroup[] | null;
  iconGroup: IconGroup | null;
  guild: Guild;
  hasPermission: boolean;
  openDropzone: () => void;
  forceUpdate: React.DispatchWithoutAction;
}> = ({ icons, iconGroups, guild, iconGroup, hasPermission, openDropzone, forceUpdate }) => {
  const checkedState = useSelector((state: RootState) => state.icon);

  const createFolder = useCallback(() => {
    const formData = new FormData();
    formData.append("guildID", guild.id);

    fetch(`${process.env.REACT_APP_API_URL}${URL.DIRECTORY}`, {
      method: "POST",
      credentials: "include",
      body: formData
    }).then(async res => {
      if (res.status !== 200) {
        throw new Error(await res.text());
      }
      // Re-render component
      toast("📁 폴더를 추가했습니다!");
      forceUpdate();
    }).catch(err => {
      toast.error(() => <div>❌ 새 폴더 생성에 실패했습니다 :(<br/>{err.message ? err.message : err.toString()}</div>);
    });
  }, [guild, forceUpdate]);

  const removeSelected = () => {
    if (!iconGroups || !icons) return;

    const selectedGroups = iconGroups.filter(group => checkedState[group.id].checked);
    const selectedIcons = icons.filter(icon => checkedState[icon.id].checked);

    if (selectedGroups.length <= 0 && selectedIcons.length <= 0) return;

    const removeGroups = fetch(`${process.env.REACT_APP_API_URL}${URL.DIRECTORIES}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        directories: selectedGroups.map(iconGroup => iconGroup.id),
        guildID: guild.id,
      })
    });

    const removeIcons = fetch(`${process.env.REACT_APP_API_URL}${URL.ICONS}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        icons: selectedIcons.map(icon => icon.id),
        guildID: guild.id,
      })
    });

    Promise.all([removeGroups, removeIcons]).then(([res1, res2]) => {
      if (!res1.ok || !res2.ok) throw new Error();

      const removed: string[] = [];
      if (selectedGroups.length > 0) removed.push(`${selectedGroups.length}개의 그룹`);
      if (selectedIcons.length > 0) removed.push(`${selectedIcons.length}개의 아이콘`);

      toast.success(`${removed.join(" 및 ")}을 삭제했습니다!`)
      forceUpdate();
    }).catch(() => {
      toast("❌ 아이콘/폴더 삭제에 실패했습니다.")
    });
  };

  return <div className="icon-menu-container">
    <div className="icon-menu-left">
      <Link to={iconGroup ? `/icon/${guild.id}` : "/icon"} className="icon-menu-item icon-back-button-container">
        <svg className="icon-arrow-icon">
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
    {
      hasPermission &&
      <div className="icon-menu-right">
        {
          !iconGroup &&
          <div className="icon-menu-item icon-add-folder-btn" onClick={createFolder} data-tip data-for="icon-menu-add-folder-tooltip">
            <svg className="icon-menu-icon">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/add-folder.svg#icon`} />
            </svg>
            <ReactTooltip id="icon-menu-add-folder-tooltip" place="top" type="dark" effect="solid">
              <span>아이콘 그룹 추가</span>
            </ReactTooltip>
          </div>
        }
        <div className="icon-menu-item icon-remove-btn" onClick={removeSelected} data-tip data-for="icon-menu-remove-tooltip">
          <svg className="icon-menu-icon">
            <use xlinkHref={`${process.env.PUBLIC_URL}/icons/trash.svg#icon`} />
          </svg>
          <ReactTooltip id="icon-menu-remove-tooltip" place="top" type="dark" effect="solid">
            <span>선택된 항목들 삭제</span>
          </ReactTooltip>
        </div>
        <div className="icon-menu-item" onClick={openDropzone}>
          <svg className="icon-upload-icon">
            <use xlinkHref={`${process.env.PUBLIC_URL}/icons/upload.svg#icon`} />
          </svg>
          <span className="icon-upload-text">업로드</span>
        </div>
      </div>
    }
  </div>
}

export default IconHeaderMenu;
