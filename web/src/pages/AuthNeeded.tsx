import "./AuthNeeded.css";

const AuthNeeded = () => {
  return (
    <div className="auth-container">
      <div className="auth-header">로그인이 필요합니다</div>
      <div className="auth-login-button" onClick={() => {
        window.location.href = `${process.env.REACT_APP_API_URL}/auth/discord`;
      }}>
        <svg className="auth-discord-icon">
          <use xlinkHref={`${process.env.PUBLIC_URL}/icons/discord.svg#icon`} />
        </svg>
        <div className="auth-login-separator"></div>
        <span>디스코드로 로그인하기</span>
      </div>
    </div>
  )
}

export default AuthNeeded;
