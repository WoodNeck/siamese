import { useEffect, useMemo } from "react";
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "./component/Sidebar";

import Home from "./pages/Home";
import Icon from "./pages/Icon";
import Command from "./pages/Command";
import Setting from "./pages/Setting";
import NotFound from "./pages/NotFound";

import { setUser } from "./redux/actions";
import { RootState } from "./redux/reducers";

import User from "~/api/type/User";

import "./Main.css";

const Main = () => {
  const dispatch = useDispatch();
  const hamburger = useSelector((state: RootState) => state.hamburger);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/user`, {
      credentials: "include"
    }).then(user => user.json())
      .then(user => dispatch(setUser(user as User)))
  }, [dispatch]);

  const pageContainerClass = useMemo(() => {
    const classes = ["page-container"];
    if (hamburger.open) {
      classes.push("noscroll");
    }
    return classes.join(" ");
  }, [hamburger]);

  return (
    <HashRouter>
      <div className="main-container">
        <Sidebar />
        <div className={pageContainerClass}>
          <Switch>
            <Route path="/icon" component={Icon} />
            <Route path="/command" component={Command} />
            <Route path="/setting" component={Setting} />
            <Route path="/" exact component={Home} />
            <Route path="*" component={NotFound} />
          </Switch>
        </div>
      </div>
    </HashRouter>
  );
}

export default Main;
