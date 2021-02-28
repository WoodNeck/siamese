import React from "react";
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";

import GuildList from "./GuildList";
import IconList from "./IconList";
import "./Icon.css";

const Icon = () => {
  const match = useRouteMatch();

  return (<Switch>
    <Route path={`${match.path}/:guildID`}>
      <IconList />
    </Route>
    <Route path={match.path}>
      <GuildList />
    </Route>
  </Switch>)
}

export default Icon;
