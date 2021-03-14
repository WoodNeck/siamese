import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <img className="home-img" src="https://i.ytimg.com/vi/uMxnmGBGL78/maxresdefault.jpg" />
      <div>샴고양이 사용중에 궁금한게 또 있어요?</div>
      <div><a href="https://discord.gg/uuSPaYtF8W">샴고양이 DevServer</a>로 오십시오</div>

      <div style={{
        padding: "15px",
        borderRadius: "5px",
        fontSize: "18px",
        backgroundColor: "#ffe08a",
        marginTop: "20px",
        color: "rgba(0,0,0,.7)"
      }}>
        <li>사이트 구조상 "크로스 웹 사이트 추적 허용"이 꺼져있으면 로그인이 불가능합니다.</li>
        <li>iOS에서 로그인이 안될 경우 <strong>설정 {"->"} 사파리 {"->"} 크로스 사이트 추적 방지</strong>를 꺼보세요</li>
        <li>시크릿 모드/개인 정보 보호 모드 등을 이용할 경우 <strong>"타사 쿠키 차단"</strong>을 꺼야만 로그인할 수 있습니다.</li>
      </div>
    </div>
  )
}

export default Home;
