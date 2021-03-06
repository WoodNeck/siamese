import React from "react";
import User from "../../../src/api/type/User";
import "./Profile.css";

const Profile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="profile-container">
      <div className="profile-overlay"
        onClick={() => {
          window.location.href = `${process.env.REACT_APP_API_URL}/logout`
        }}
      >로그아웃</div>
      <img className="profile-avatar" src={user.avatarURL} />
    </div>
  )
}

export default Profile;
