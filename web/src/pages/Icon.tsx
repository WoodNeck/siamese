import { useState, useEffect } from "react";
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";

import GuildList from "./GuildList";
import IconList from "./IconList";
import "./Icon.css";
import Loading from "../component/Loading";
import Guild from "../../../src/api/type/Guild";

const Icon = () => {
  const match = useRouteMatch();
  const [guilds, setGuilds] = useState<Guild[] | null>(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/guilds`, {
      credentials: "include"
    }).then(res => res.json())
      .then(guilds => {
        setGuilds(guilds as Guild[]);
      })
  }, []);

  if (!guilds) return <Loading />

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
