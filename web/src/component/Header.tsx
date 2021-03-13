import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Login from "./Login";
import Profile from "./Profile";
import { RootState } from "../redux/reducers";

import "./Header.css";
import { toggleHamburger } from "../redux/actions";

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const hamburger = useSelector((state: RootState) => state.hamburger);
  const dispatch = useDispatch();

  const containerClass = useMemo(() => {
    const classes = ["header-container"];
    if (hamburger.open) classes.push("sidebar");

    return classes.join(" ");
  }, [hamburger]);

  return (
    <div className={containerClass}>
      <div className="header-menu-left">
      <div className="header-burger" onClick={() => dispatch(toggleHamburger())}>
        <svg className="header-burger-icon">
          <use xlinkHref={
            hamburger.open
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
