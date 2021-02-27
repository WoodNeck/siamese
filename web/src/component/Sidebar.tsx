import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <span>샴고양이</span>
        </div>
        <img className="sidebar-logo-img" alt="logo" src="/logo20.png" />
      </div>
      <div className="sidebar-menu">
        <div className="sidebar-menu-item selected">
          <svg className="sidebar-menu-icon">
            <use xlinkHref="/icons/home.svg#icon" />
          </svg>
          <span>홈</span>
        </div>
        <div className="sidebar-menu-item">
          <svg className="sidebar-menu-icon">
            <use xlinkHref="/icons/archive.svg#icon" />
          </svg>
          <span>아이콘</span>
        </div>
        <div className="sidebar-menu-item">
          <svg className="sidebar-menu-icon">
            <use xlinkHref="/icons/bolt.svg#icon" />
          </svg>
          <span>명령어 목록</span>
        </div>
      </div>
      <div className="sidebar-others">
        <div className="sidebar-others-item">
          <svg className="sidebar-others-icon">
            <use xlinkHref="/icons/discord.svg#icon" />
          </svg>
          <span>샴고양이 초대하기</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
