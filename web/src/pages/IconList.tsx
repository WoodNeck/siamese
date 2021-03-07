import React, { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import {
  Link,
  useParams
} from "react-router-dom";
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useDropzone } from "react-dropzone";
import { ToastContainer, toast } from "react-toastify";
import { Checkbox } from "pretty-checkbox-react";

import Loading from "../component/Loading";
import * as URL from "../../../src/api/const/url";
import Guild from "../../../src/api/type/Guild";
import Icon from "../../../src/api/type/Icon";
import IconGroup from "../../../src/api/type/IconGroup";
import "./IconList.css";
import "react-toastify/dist/ReactToastify.min.css";
import "@djthoms/pretty-checkbox";

const IconList: React.FC<{
  guilds: Guild[]
}> = ({ guilds }) => {
  const { guildID, groupID } = useParams<{ guildID: string, groupID?: string }>();
  const [iconGroups, setIconGroups] = useState<Array<IconGroup & { selected: boolean }> | null>(null);
  const [icons, setIcons] = useState<Array<Icon & { selected: boolean }> | null>(null);
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
          setIcons(images.map((icon: Icon) => ({...icon, selected: false})));
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
        setIconGroups(groups.map((group: IconGroup) => ({...group, selected: false})));
        setIcons(images.map((icon: Icon) => ({...icon, selected: false})));
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
    disabled: !guild.hasPermission,
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

  const updateName = useCallback((item: Icon | IconGroup, newName: string, el: HTMLInputElement, isIcon: boolean) => {
    newName = newName.replace(/\s+/, "");

    el.value = newName;
    const endPoint = isIcon ? URL.ICON : URL.DIRECTORY;
    const itemName = isIcon ? "아이콘 이름" : "그룹명";

    fetch(`${process.env.REACT_APP_API_URL}${endPoint}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        id: item.id,
        name: newName
      })
    }).then(async res => {
      if (res.status !== 200) {
        throw new Error(await res.text());
      }
      // Re-render component
      toast.success(`${itemName}을 업데이트했습니다!`);
      forceUpdate();
    }).catch(err => {
      el.value = item.name;
      toast.error(() => <div>❌ {itemName}을 변경하지 못했습니다<br/>{err.message ? err.message : err.toString()}</div>);
    });
  }, []);

  const createFolder = useCallback(() => {
    const formData = new FormData();
    formData.append("guildID", guildID);

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
  }, [guildID]);

  const removeSelected = useCallback(() => {
    if (!iconGroups || !icons) return;

    const selectedGroups: IconGroup[] = iconGroups.filter(group => group.selected);
    const selectedIcons: Icon[] = icons.filter(icon => icon.selected);

    if (selectedGroups.length <= 0 && selectedIcons.length <= 0) return;

    const removeGroups = fetch(`${process.env.REACT_APP_API_URL}${URL.DIRECTORIES}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        directories: selectedGroups.map(iconGroup => iconGroup.id),
        guildID,
      })
    });

    const removeIcons = fetch(`${process.env.REACT_APP_API_URL}${URL.ICONS}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        icons: selectedIcons.map(iconGroup => iconGroup.id),
        guildID,
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
  }, [guildID, iconGroups, icons]);

  const allChecked = useMemo(() => {
    if (!iconGroups || !icons) return false;
    if (iconGroups.length <= 0 && icons.length <= 0) return false;

    return icons.every(icon => icon.selected) && iconGroups.every(group => group.selected);
  }, [icons, iconGroups])

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
        {
          guild.hasPermission &&
          <div className="icon-menu-right">
            {
              !iconGroup &&
              <div className="icon-menu-item icon-add-folder-btn" onClick={createFolder}>
                <svg className="icon-menu-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/add-folder.svg#icon`} />
                </svg>
              </div>
            }
            <div className="icon-menu-item icon-remove-btn" onClick={removeSelected}>
              <svg className="icon-menu-icon">
                <use xlinkHref={`${process.env.PUBLIC_URL}/icons/trash.svg#icon`} />
              </svg>
            </div>
            <div className="icon-menu-item" onClick={open}>
              <svg className="icon-upload-icon">
                <use xlinkHref={`${process.env.PUBLIC_URL}/icons/upload.svg#icon`} />
              </svg>
              <span className="icon-upload-text">업로드</span>
            </div>
          </div>
        }
      </div>
      <div className="icon-item-container">
        <div className="icon-item icon-item-header">
          { guild.hasPermission &&
            <div className="icon-item-checkbox-container">
              <Checkbox color="danger" bigger shape="curve" variant="thick" className="icon-item-checkbox"
                icon={<svg className="icon-checkbox-icon"><use xlinkHref={`${process.env.PUBLIC_URL}/icons/cancel.svg#icon`} /></svg>}
                checked={allChecked}
                onChange={e => {
                  const checked = e.currentTarget.checked;

                  setIcons([...icons.map(icon => ({ ...icon, selected: checked }))]);
                  setIconGroups([...iconGroups.map(group => ({ ...group, selected: checked }))]);
                }}></Checkbox>
            </div>
          }
          <div className="icon-item-name-container header-name">이름</div>
          <div className="icon-item-author">생성자</div>
          <div className="icon-item-count">아이콘 개수</div>
          <div className="icon-item-date">생성일자</div>
        </div>
        {
          iconGroups.map(iconGroup => (
            <Link to={`/icon/${guildID}/${iconGroup.id}`} key={iconGroup.id} className="icon-item">
              { guild.hasPermission &&
                <div className="icon-item-checkbox-container" onClick={e => {
                  e.stopPropagation();

                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                    e.preventDefault();
                  }
                }}>
                  <Checkbox color="danger" animation="jelly" bigger shape="curve" variant="thick" className="icon-item-checkbox"
                    icon={<svg className="icon-checkbox-icon"><use xlinkHref={`${process.env.PUBLIC_URL}/icons/cancel.svg#icon`} /></svg>}
                    checked={iconGroup.selected}
                    onChange={() => {
                      iconGroup.selected = !iconGroup.selected;
                      setIconGroups([...iconGroups]);
                    }}
                  ></Checkbox>
                </div>
              }
              <div className="icon-item-name-container">
                <svg className="icon-item-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/folder.svg#icon`} />
                </svg>
                <input type="text" maxLength={10}
                  onBlur={e => {
                    const newName = e.target.value;
                    if (newName !== iconGroup.name) {
                      updateName(iconGroup, newName, e.target, false);
                    }
                  }}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="icon-item-name" defaultValue={iconGroup.name} disabled={ !guild.hasPermission } />
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
              { guild.hasPermission &&
                <div className="icon-item-checkbox-container" onClick={e => e.stopPropagation()}>
                  <Checkbox color="danger" animation="jelly" bigger shape="curve" variant="thick" className="icon-item-checkbox"
                    icon={<svg className="icon-checkbox-icon"><use xlinkHref={`${process.env.PUBLIC_URL}/icons/cancel.svg#icon`} /></svg>}
                    checked={icon.selected}
                    onChange={() => {
                      icon.selected = !icon.selected;
                      setIcons([...icons]);
                    }}></Checkbox>
                </div>
              }
              <div className="icon-item-name-container">
                <svg className="icon-item-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/image.svg#icon`} />
                </svg>
                <input type="text" maxLength={10}
                  onBlur={e => {
                    const newName = e.target.value;
                    if (newName !== icon.name) {
                      updateName(icon, newName, e.target, true);
                    }
                  }}
                  onClick={e => e.stopPropagation()}
                  className="icon-item-name" defaultValue={icon.name} disabled={ !guild.hasPermission } />
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
