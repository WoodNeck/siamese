import "./Login.css";

const Login = () => {
  return (
    <div className="header-menu">
      <div className="header-menu-item" onClick={() => {
        window.location.href = `${process.env.REACT_APP_API_URL}/auth/discord`;
      }}>
        <svg className="header-menu-icon">
          <use xlinkHref={`${process.env.PUBLIC_URL}/icons/login.svg#icon`} />
        </svg>
        <span>로그인</span>
      </div>
    </div>
  )
};

export default Login;
