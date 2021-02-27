import './Main.css';
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";

const Main = () => {
  return (
    <div className="main-container">
      <Sidebar />
      <div className="contents-container">
        <Header />
        <div className="page-container">
          페이지 영역
        </div>
      </div>
    </div>
  );
}

export default Main;
