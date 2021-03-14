import React from "react";
import User from "~/api/type/User";
import "./Profile.css";

const Profile: React.FC<{ user: User }> = ({ user }) => {
  const logout = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/logout`;
  }

  return (
    <div className="profile-container">
      <div className="profile-overlay"
        onClick={logout}
      >로그아웃</div>
      <img className="profile-avatar" src={user.avatarURL} />
      <span className="profile-username">{ user.tag }</span>
      <div className="profile-logout" onClick={logout}>로그아웃</div>
    </div>
  )
}

export default Profile;
