import React, { useEffect } from "react";
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import GuildList from "./GuildList";
import IconList from "./IconList";
import AuthNeeded from "./AuthNeeded";
import Loading from "../component/Loading";
import { RootState } from "../redux/reducers";
import { setGuilds } from "../redux/actions";
import Guild from "../../../src/api/type/Guild";

import "./Icon.css";

const Icon: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const guilds = useSelector((state: RootState) => state.guilds);
  const match = useRouteMatch();
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/guilds`, {
      credentials: "include"
    }).then(res => res.json())
      .then(guilds => dispatch(setGuilds(guilds as Guild[])))
  }, [dispatch]);

  if (!user || !user.id) return <AuthNeeded />;
  if (!guilds) return <Loading />;

  return (<Switch>
    <Route path={[
      `${match.path}/:guildID/:groupID`,
      `${match.path}/:guildID`
    ]}>
      <IconList guilds={guilds} />
    </Route>
    <Route path={match.path}>
      <GuildList guilds={guilds} />
    </Route>
  </Switch>)
}

export default Icon;
