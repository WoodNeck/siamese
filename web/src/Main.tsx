import { useEffect } from "react";
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";
import { useDispatch } from "react-redux";

import Sidebar from "./component/Sidebar";
import Header from "./component/Header";

import Home from "./pages/Home";
import Icon from "./pages/Icon";
import Command from "./pages/Command";
import Setting from "./pages/Setting";
import NotFound from "./pages/NotFound";

import { setUser } from "./redux/actions";

import User from "../../src/api/type/User";

import "./Main.css";

const Main = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/user`, {
      credentials: "include"
    }).then(user => user.json())
      .then(user => dispatch(setUser(user as User)))
  }, [dispatch]);

  return (
    <HashRouter>
      <div className="main-container">
        <Header />
        <div className="contents-container">
          <Sidebar />
          <div className="page-container">
            <Switch>
              <Route path="/icon" component={Icon} />
              <Route path="/command" component={Command} />
              <Route path="/setting" component={Setting} />
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
