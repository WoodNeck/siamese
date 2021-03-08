import React, { useMemo } from "react";
import {
  Link
} from "react-router-dom";

import "./Header.css";
import Login from "./Login";
import Profile from "./Profile";
import User from "../../../src/api/type/User";

const Header: React.FC<{
  user: User | null;
  sidebarVisible: boolean;
  setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ user, sidebarVisible, setSidebarVisible }) => {
  const containerClass = useMemo(() => {
    const classes = ["header-container"];
    if (sidebarVisible) classes.push("sidebar");

    return classes.join(" ");
  }, [sidebarVisible]);

  return (
    <div className={containerClass}>
      <div className="header-menu-left">
      <div className="header-burger" onClick={() => setSidebarVisible(!sidebarVisible)}>
        <svg className="header-burger-icon">
          <use xlinkHref={
            sidebarVisible
              ? `${process.env.PUBLIC_URL}/icons/cancel.svg#icon`
              : `${process.env.PUBLIC_URL}/icons/hamburger.svg#icon`
            } />
        </svg>
      </div>
      <Link to="/" className="header-logo">
        <div className="header-logo-text">
          <span>샴고양이</span>
        </div>
        <img className="header-logo-img" alt="logo" src={`${process.env.PUBLIC_URL}/logo20.png`} />
      </Link>
      </div>
      <div className="header-menu-right">
        {user != null
          ? user.id
            ? <Profile user={user} />
            : <Login />
          : <></>
        }
      </div>
    </div>
  );
}

export default Header;
