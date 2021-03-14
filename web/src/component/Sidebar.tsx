import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Login from "./Login";
import Profile from "./Profile";
import SubcategoryLink from "./SubcategoryLink";

import { toggleHamburger } from "../redux/actions";
import { RootState } from "../redux/reducers";
import * as CATEGORY from "~/const/category";

import "./Sidebar.css";

interface Route {
  path: string;
  name: string;
  icon: string;
  active: boolean;
  subcategories?: JSX.Element[];
}

const Sidebar: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const hamburger = useSelector((state: RootState) => state.hamburger);
  const guilds = useSelector((state: RootState) => state.guilds);
  const dispatch = useDispatch();
  const location = useLocation();

  const routes: Route[] = useMemo(() => [
    {
      path: "/",
      name: "홈",
      icon: "home",
      active: location.pathname === "/"
    },
    {
      path: "/icon",
      name: "아이콘",
      icon: "archive",
      active: location.pathname.startsWith("/icon"),
      subcategories: guilds?.map(guild =>
        <SubcategoryLink to={`/icon/${guild.id}`} key={guild.id} className="guild-link">
          <img className="subcategory-icon" src={ guild.iconURL ? guild.iconURL : `${process.env.PUBLIC_URL}/icons/discord.svg#icon`}></img>
          { guild.name }
        </SubcategoryLink>
      )
    },
    {
      path: "/command/bot",
      name: "명령어 목록",
      icon: "bolt",
      active: location.pathname.startsWith("/command"),
      subcategories: Object.values(CATEGORY)
        .map(category => <SubcategoryLink to={`/command/${category.ID}`} key={category.ID}>{category.EMOJI} {category.NAME}</SubcategoryLink>)
    },
    {
      path: "/setting",
      name: "서버 설정",
      icon: "setting",
      active: location.pathname.startsWith("/setting"),
    }
  ], [guilds, location]);

  const containerClass = useMemo(() => {
    const classes = ["sidebar-container"];
    if (hamburger.open) classes.push("visible");

    return classes.join(" ");
  }, [hamburger]);

  return (
    <div className={containerClass}>
      <div className="sidebar-menu-item-container header">
        <div className="header-burger" onClick={() => dispatch(toggleHamburger())}>
          <svg className="header-burger-icon">
            <use xlinkHref={
              hamburger.open
                ? `${process.env.PUBLIC_URL}/icons/cancel.svg#icon`
                : `${process.env.PUBLIC_URL}/icons/hamburger.svg#icon`
              } />
          </svg>
        </div>
        <div className="header-logo">
          <div className="header-logo-text">
            <span>샴고양이</span>
          </div>
          <img className="header-logo-img" alt="logo" src={`${process.env.PUBLIC_URL}/logo20.png`} />
        </div>
      </div>
      <div className="sidebar-menu">
        {routes.map((route) => (
          <div className="sidebar-menu-item-container" key={route.name}>
            <NavLink to={route.path} className="sidebar-menu-item" activeClassName="selected"
              isActive={() => route.active}
            >
              <svg className="sidebar-menu-icon">
                <use xlinkHref={`${process.env.PUBLIC_URL}/icons/${route.icon}.svg#icon`} />
              </svg>
              <span>{route.name}</span>
            </NavLink>
            { route.active && route.subcategories }
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="sidebar-menu-item-container">
            {user != null
              ? user.id
                ? <Profile user={user} />
                : <Login />
              : <></>
            }
          </div>
          <div className="sidebar-menu-item-container">
            <a target="_blank" rel="noreferrer" href="https://discord.com/oauth2/authorize?client_id=357073005819723777&permissions=3238976&scope=bot">
              <div className="sidebar-others-item">
                <svg className="sidebar-others-icon">
                  <use xlinkHref={`${process.env.PUBLIC_URL}/icons/discord.svg#icon`} />
                </svg>
                <span>샴고양이 초대하기</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
