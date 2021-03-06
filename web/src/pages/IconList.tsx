import React, { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import {
  Link,
  useParams
} from "react-router-dom";
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useDropzone } from "react-dropzone";
import { ToastContainer, toast } from "react-toastify";

import Loading from "../component/Loading";
import * as URL from "../../../src/api/const/url";
import Guild from "../../../src/api/type/Guild";
import Icon from "../../../src/api/type/Icon";
import IconGroup from "../../../src/api/type/IconGroup";
import "./IconList.css";
import "react-toastify/dist/ReactToastify.min.css";

const IconList: React.FC<{
  guilds: Guild[]
}> = ({ guilds }) => {
  const { guildID, groupID } = useParams<{ guildID: string, groupID?: string }>();
  const [iconGroups, setIconGroups] = useState<IconGroup[] | null>(null);
  const [icons, setIcons] = useState<Icon[] | null>(null);
  const [iconGroup, setIconGroup] = useState<IconGroup | null>(null);

  const guild = guilds.find(guild => guild.id === guildID)!;
  const modal = withReactContent(Swal);

  const [iconFetcher, forceUpdate] = useReducer(x => x + 1, 0);

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
  }, [guildID, groupID, iconFetcher]);

  const showIcon = useCallback((icon: Icon) => {
    modal.fire({
      imageUrl: icon.url,
      heightAuto: false
    });
  }, [modal]);

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: "image/jpg, image/jpeg, image/png, image/gif, image/webp",
    noClick: true,
    noKeyboard: true,
    maxSize: 8388608, // 8MB
    onDrop: files => {
      if (files.length <= 0) {
        modal.fire({
          icon: "error",
          html: "이미지 크기가 너무 크거나(8MB 이상)<br/>지원하지 않는 파일 포맷이 섞여있어요!",
          heightAuto: false
        });
        return;
      }

      const formData = new FormData();

      formData.append("guildID", guildID);
      if (groupID) {
        formData.append("groupID", groupID);
      }

      files.forEach(file => {
        formData.append("icons[]", file, file.name);
      });

      const uploadingToast = toast(`${files.length}개의 아이콘을 업로드중입니다...`, { autoClose: false });

      fetch(`${process.env.REACT_APP_API_URL}${URL.ICONS}`, {
        method: "POST",
        credentials: "include",
        body: formData
      }).then(async res => {
        if (res.status !== 200) {
          throw new Error(await res.text());
        }
        // Re-render component
        toast.update(uploadingToast, {
          render: `${files.length}개의 아이콘을 추가했습니다!`,
          type: toast.TYPE.SUCCESS,
          autoClose: 5000
        });
        forceUpdate();
      }).catch(err => {
        toast.update(uploadingToast, {
          render: () => <div>❌ 아이콘 업로드에 실패했습니다 :(<br/>{err.message ? err.message : err.toString()}</div>,
          type: toast.TYPE.ERROR,
          autoClose: 5000
        });
      });
    }
  });

  const containerClass = useMemo(() => {
    const classes = ["icon-container"];

    isDragActive && classes.push("drag-active");
    isDragAccept && classes.push("drag-accept");
    isDragReject && classes.push("drag-reject");

    return classes.join(" ");
  }, [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  const updateIconName = (icon: Icon, newName: string, el: HTMLInputElement) => {
    el.value = newName;

    fetch(`${process.env.REACT_APP_API_URL}${URL.ICON}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        id: icon.id,
        name: newName
      })
    }).then(async res => {
      if (res.status !== 200) {
        throw new Error(await res.text());
      }
      // Re-render component
      toast.success("아이콘 이름을 업데이트했습니다!");
      forceUpdate();
    }).catch(err => {
      el.value = icon.name;
      toast.error(() => <div>❌ 아이콘 이름을 변경하지 못했습니다<br/>{err.message ? err.message : err.toString()}</div>);
    });
  };

  if (!iconGroups || !icons) return <Loading />

  return (
    <div {...getRootProps({className: containerClass})}>
      <div className="icon-menu-container">
        <div className="icon-menu-left">
          <Link to={groupID ? `/icon/${guildID}` : "/icon"} className="icon-menu-item icon-back-button-container">
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
        <div className="icon-menu-right">
          {
            !iconGroup &&
            <div className="icon-menu-item icon-add-folder-btn">
              <svg className="icon-menu-icon">
                <use xlinkHref={`${process.env.PUBLIC_URL}/icons/add-folder.svg#icon`} />
              </svg>
            </div>
          }
          <div className="icon-menu-item icon-remove-btn">
            <svg className="icon-menu-icon">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/trash.svg#icon`} />
            </svg>
          </div>
          <div className="icon-menu-item">
            <svg className="icon-upload-icon">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/upload.svg#icon`} />
            </svg>
            <span className="icon-upload-text" onClick={open}>업로드</span>
          </div>
        </div>
      </div>
      <div className="icon-item-container">
        <div className="icon-item icon-item-header">
          <input type="checkbox" className="icon-item-checkbox" onClick={e => e.stopPropagation()}></input>
          <div className="icon-item-name-container header-name">이름</div>
          <div className="icon-item-author">생성자</div>
          <div className="icon-item-count">아이콘 개수</div>
          <div className="icon-item-date">생성일자</div>
        </div>
        <div className="icon-item-separator"></div>
        {
          iconGroups.map(iconGroup => (
            <Link to={`/icon/${guildID}/${iconGroup.id}`} key={iconGroup.id} className="icon-item">
              <input type="checkbox" className="icon-item-checkbox" onClick={e => e.stopPropagation()}></input>
              <div className="icon-item-name-container">
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
          icons.map((icon: Icon) => (
            <div key={icon.id} className="icon-item" onClick={() => showIcon(icon)}>
              <input type="checkbox" className="icon-item-checkbox" onClick={e => e.stopPropagation()}></input>
              <div className="icon-item-name-container">
                <svg className="icon-item-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/image.svg#icon`} />
                </svg>
                <input type="text" maxLength={10}
                  onBlur={e => {
                    const newName = e.target.value;
                    if (newName !== icon.name) {
                      updateIconName(icon, newName.replace(/\s+/, ""), e.target);
                    }
                  }}
                  onClick={e => e.stopPropagation()}
                  className="icon-item-name" defaultValue={icon.name} />
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
      <div className="icon-drag-visualizer">
        <svg className="icon-drag-add">
          <use xlinkHref={`${process.env.PUBLIC_URL}/icons/add.svg#icon`} />
        </svg>
        <div className="icon-drag-reject-container">
          <svg className="icon-drag-reject">
            <use xlinkHref={`${process.env.PUBLIC_URL}/icons/cancel.svg#icon`} />
          </svg>
          <div>지원하지 않는 파일 포맷이 섞여있어요!</div>
        </div>
      </div>
      <input {...getInputProps()} />
      <ToastContainer position="bottom-right" closeOnClick />
    </div>
  );
}

export default IconList;
