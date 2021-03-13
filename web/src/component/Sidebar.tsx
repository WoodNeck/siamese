import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import GuildLink from "./GuildLink";

import "./Sidebar.css";
import { RootState } from "../redux/reducers";

interface Route {
  path: string;
  name: string;
  icon: string;
  active: boolean;
  subcategories?: JSX.Element[];
}

const Sidebar: React.FC = () => {
  const hamburger = useSelector((state: RootState) => state.hamburger);
  const guilds = useSelector((state: RootState) => state.guilds);
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
      subcategories: guilds?.map(guild => <GuildLink key={guild.id} guild={guild} />)
    },
    {
      path: "/command",
      name: "명령어 목록",
      icon: "bolt",
      active: location.pathname.startsWith("/command")  ,
    },
    {
      path: "/setting",
      name: "길드 설정",
      icon: "setting",
      active: location.pathname.startsWith("/setting")  ,
    }
  ], [guilds, location]);

  const containerClass = useMemo(() => {
    const classes = ["sidebar-container"];
    if (hamburger.open) classes.push("visible");

    return classes.join(" ");
  }, [hamburger]);

  return (
    <div className={containerClass}>
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
      </div>
      <div className="sidebar-others">
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
  );
}

export default Sidebar;
