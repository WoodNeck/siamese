import {
  NavLink
} from "react-router-dom";

import "./Sidebar.css";

interface Route {
  path: string;
  name: string;
  icon: string;
}

const routes: Route[] = [
  {
    path: "/",
    name: "홈",
    icon: "home"
  },
  {
    path: "/icon",
    name: "아이콘",
    icon: "archive"
  },
  {
    path: "/command",
    name: "명령어 목록",
    icon: "bolt"
  }
];

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-menu">
        {routes.map((route) => (
          <NavLink to={route.path} className="sidebar-menu-item" activeClassName="selected"
            key={route.name}
            isActive={(match, location) => {
              if (!match) return false;

              return location.pathname === route.path;
            }}
          >
            <svg className="sidebar-menu-icon">
              <use xlinkHref={`${process.env.PUBLIC_URL}/icons/${route.icon}.svg#icon`} />
            </svg>
            <span>{route.name}</span>
          </NavLink>
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
