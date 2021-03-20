import React, { useEffect } from "react";
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import GuildList from "./GuildList";
import GuildSetting from "./GuildSetting";
import AuthNeeded from "./AuthNeeded";
import Loading from "../component/Loading";
import { RootState } from "../redux/reducers";
import { setGuilds } from "../redux/actions";

import Guild from "~/api/type/Guild";

import "./Setting.css";

const Setting: React.FC = () => {
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

  if (!user) return <></>;
  if (!user.id) return <AuthNeeded />;
  if (!guilds) return <Loading />;

  return (<Switch>
    <Route path={`${match.path}/:guildID`}>
      <GuildSetting />
    </Route>
    <Route path={match.path}>
      <GuildList to="setting" subtitle="서버 설정을 편집할 서버를 선택해주세요" taskName="서버 설정"
        hasPermission={guild => guild.isAdmin} />
    </Route>
  </Switch>)
};

export default Setting;
