import React from "react";
import Swal from "sweetalert2";
import { ReactSweetAlert } from "sweetalert2-react-content";

import Icon from "~/api/type/Icon";
import IconGroup from "~/api/type/IconGroup";
import User from "~/api/type/User";

import "./IconChat.css";

const IconChat: React.FC<{
  user: User;
  icon: Icon;
  iconGroup: IconGroup | null;
  modal: typeof Swal & ReactSweetAlert;
}> = ({ user, icon, iconGroup, modal }) => {
  return <div className="chat-container" onClick={() => {
    modal.clickConfirm();
  }}>
    <div className="chat-item">
      <img className="chat-author-image" src={user.avatarURL} />
      <div className="chat-contents">
        <span className="chat-author-name">{ user.username }</span>
        <span>~{ iconGroup ? `${iconGroup.name} ${icon.name}` : icon.name }</span>
      </div>
    </div>
    <div className="chat-item">
      <img className="chat-author-image" src={`${process.env.PUBLIC_URL}/logo20.png`} />
      <div className="chat-contents">
        <div className="chat-name-wrapper">
          <span className="chat-author-name">샴고양이</span>
          <div className="chat-bot-tag">
            <svg style={{marginLeft: "-4px"}} width="16" height="16" viewBox="0 0 16 15.2"><path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="currentColor"></path></svg>
            <span>봇</span>
          </div>
        </div>
        <div className="chat-embed-wrapper">
          <div className="chat-embed-author">
            <img className="chat-embed-author-image" src={user.avatarURL} />
            <span className="chat-embed-author-name">{ user.username }</span>
          </div>
          <img className="chat-icon-image" src={icon.url} />
        </div>
      </div>
    </div>
  </div>
}

export default IconChat;
