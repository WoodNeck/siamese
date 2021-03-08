import { useState, useEffect } from "react";
import {
  HashRouter,
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
import User from "../../src/api/type/User";
import Guild from "../../src/api/type/Guild";

const Main = () => {
  const [user, setUser] = useState<User | null>(null);
  const [guilds, setGuilds] = useState<Guild[] | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/user`, {
      credentials: "include"
    }).then(user => user.json())
      .then(user => {
        setUser(user as User);
      })
  }, []);

  return (
    <HashRouter>
      <div className="main-container">
        <Header user={user} sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />
        <div className="contents-container">
          <Sidebar guilds={guilds} visible={sidebarVisible} />
          <div className="page-container">
            <Switch>
              <Route path="/icon">
                {
                  user
                    ? user.id
                      ? <Icon guilds={guilds} setGuilds={setGuilds} />
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
    </HashRouter>
  );
}

export default Main;
