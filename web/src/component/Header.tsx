import {
  Link
} from "react-router-dom";

import './Header.css';

const Header = () => {
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
      <a href="https://discordapp.com/api/oauth2/authorize?client_id=357073005819723777&scope=identify&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback">
        <div className="header-menu">
          <svg className="header-menu-icon">
            <use xlinkHref={`${process.env.PUBLIC_URL}/icons/login.svg#icon`} />
          </svg>
          <span>로그인</span>
        </div>
      </a>
    </div>
  );
}

export default Header;
