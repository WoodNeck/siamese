import React from "react";
import {
  Link
} from "react-router-dom";

import "./Header.css";
import Login from "./Login";
import Profile from "./Profile";
import User from "../../../src/api/type/User";

const Header: React.FC<{
  user: User | null;
}> = ({ user }) => {
  return (
    <div className="header-container">
      <Link to="/">
        <div className="header-logo">
          <div className="header-logo-text">
            <span>샴고양이</span>
          </div>
          <img className="header-logo-img" alt="logo" src={`${process.env.PUBLIC_URL}/logo20.png`} />
        </div>
      </Link>
      {user != null
        ? user.id
          ? <Profile user={user} />
          : <Login />
        : <></>
      }
    </div>
  );
}

export default Header;
