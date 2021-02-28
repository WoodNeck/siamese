import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import "./Main.css";
import Sidebar from "./component/Sidebar";
import Header from "./component/Header";
import Home from "./pages/Home";
import Icon from "./pages/Icon";
import Command from "./pages/Command";
import NotFound from "./pages/NotFound";
import AuthNeeded from "./pages/AuthNeeded";
import User from "./type/User";

const Main = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/user`, {
      credentials: "include"
    }).then(user => user.json())
      .then(user => {
        setUser(user as User);
      })
  }, []);

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="main-container">
        <Header user={user} />
        <div className="contents-container">
          <Sidebar />
          <div className="page-container">
            <Switch>
              <Route path="/icon">
                {
                  user
                    ? user.id
                      ? <Icon />
                      : <AuthNeeded />
                    : <></>
                }
              </Route>
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
