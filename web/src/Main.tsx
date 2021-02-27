import {
  useState
} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import './Main.css';
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import Home from "./pages/Home";
import Icon from "./pages/Icon";
import Command from "./pages/Command";
import NotFound from "./pages/NotFound";

const Main = () => {
  const [ user ] = useState<{
    id: string;
  }>();

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="main-container">
        <Header />
        <div className="contents-container">
          <Sidebar />
          <div className="page-container">
            <Switch>
              <Route path="/icon" component={() => Icon({ user })} />
              <Route path="/command" component={Command} />
              <Route path="/" exact component={Home} />
              <Route path="*" component={NotFound} />
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default Main;
