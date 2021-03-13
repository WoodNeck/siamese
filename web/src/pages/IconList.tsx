import React, { useState, useEffect, useMemo, useReducer, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useDropzone } from "react-dropzone";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import NotFound from "./NotFound";
import IconHeaderMenu from "../component/IconHeaderMenu";
import Loading from "../component/Loading";
import MasterCheckbox from "../component/MasterCheckbox";
import ItemCheckbox from "../component/ItemCheckbox";
import NameInput from "../component/NameInput";
import { RootState } from "../redux/reducers";
import { setCheckedIcons } from "../redux/actions";
import * as URL from "~/api/const/url";
import Icon from "~/api/type/Icon";
import IconGroup from "~/api/type/IconGroup";

import "./IconList.css";
import "react-toastify/dist/ReactToastify.min.css";
import "@djthoms/pretty-checkbox";

enum ItemType {
  ICON,
  GROUP
}

const IconList: React.FC = () => {
  const guilds = useSelector((state: RootState) => state.guilds);
  const dispatch = useDispatch();

  const { guildID, groupID } = useParams<{ guildID: string, groupID?: string }>();
  const [iconGroups, setIconGroups] = useState<IconGroup[] | null>(null);
  const [icons, setIcons] = useState<Icon[] | null>(null);
  const [iconGroup, setIconGroup] = useState<IconGroup | null>(null);

  const guild = guilds.find(guild => guild.id === guildID)!;
  const [iconFetcher, forceUpdate] = useReducer(x => x + 1, 0);

  const modal = withReactContent(Swal);
  const hasPermission = guild ? guild.hasPermission : false;

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
        dispatch(setCheckedIcons([...images as Icon[]].map(item => item.id)));
        setIconGroups([]);
        setIcons(images);
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
        dispatch(setCheckedIcons([...images as Icon[], ...groups as IconGroup[]].map(item => item.id)));
        setIconGroups(groups.map((group: IconGroup) => ({...group, selected: false, editing: false})));
        setIcons(images.map((icon: Icon) => ({...icon, selected: false})));
        setIconGroup(null);
      });
    }
  }, [guildID, groupID, iconFetcher, dispatch]);

  const showIcon = useCallback((icon: Icon) => {
    modal.fire({
      imageUrl: icon.url,
      heightAuto: false
    });
  }, [modal]);

  const updateName = useCallback((item: Icon | IconGroup, type: ItemType, newName: string) => {
    const prevName = item.name;
    newName = newName.replace(/\s+/, "");

    const endPoint = type === ItemType.ICON ? URL.ICON : URL.DIRECTORY;
    const itemName = type === ItemType.ICON ? "아이콘 이름" : "그룹명";

    item.name = newName;
    if (type === ItemType.ICON && icons) {
      setIcons([...icons]);
    } else if (type === ItemType.GROUP && iconGroups) {
      setIconGroups([...iconGroups]);
    }

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
    }).catch(err => {
      item.name = prevName;
      if (type === ItemType.ICON && icons) {
        setIcons([...icons]);
      } else if (type === ItemType.GROUP && iconGroups) {
        setIconGroups([...iconGroups]);
      }
      toast.error(() => <div>❌ {itemName}을 변경하지 못했습니다<br/>{err.message ? err.message : err.toString()}</div>);
    });
  }, [icons, iconGroups]);

  const {
    getRootProps,
    getInputProps,
    open: openDropzone,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: "image/jpg, image/jpeg, image/png, image/gif, image/webp",
    disabled: !hasPermission,
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

  if (!guild) return <NotFound />
  if (!iconGroups || !icons) return <Loading />

  return (
    <div {...getRootProps({className: containerClass})}>
      <IconHeaderMenu
        icons={icons} iconGroups={iconGroups} iconGroup={iconGroup}
        guild={guild} hasPermission={hasPermission} openDropzone={openDropzone} forceUpdate={forceUpdate}
      />
      <div className="icon-item-container">
        <div className="icon-item icon-item-header">
          { hasPermission && <MasterCheckbox /> }
          <div className="icon-item-name-container header-name">이름</div>
          <div className="icon-item-author">생성자</div>
          <div className="icon-item-count">아이콘 개수</div>
          <div className="icon-item-date">생성일자</div>
        </div>
        {
          iconGroups.map(iconGroup => (
            <Link key={iconGroup.id} className="icon-item" to={`/icon/${guildID}/${iconGroup.id}`}>
                { guild.hasPermission && <ItemCheckbox id={iconGroup.id} />}
                <div className="icon-item-name-container">
                <svg className="icon-item-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/folder.svg#icon`} />
                </svg>
                <NameInput name={iconGroup.name} onUpdate={newName => updateName(iconGroup, ItemType.GROUP, newName)} />
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
              { guild.hasPermission && <ItemCheckbox id={icon.id} />}
              <div className="icon-item-name-container">
                <svg className="icon-item-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/image.svg#icon`} />
                </svg>
                <NameInput name={icon.name} onUpdate={newName => updateName(icon, ItemType.ICON, newName)} />
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
