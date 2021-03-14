import {
  Switch,
  Route
} from "react-router-dom";

import Bot from "./command/Bot";
import Utility from "./command/Utility";
import Search from "./command/Search";
import Sound from "./command/Sound";
import History from "./command/History";
import Steam from "./command/Steam";
import Icon from "./command/Icon";

import NotFound from "./NotFound";

import * as CATEGORY from "~/const/category";

import "./Command.css";

const Command = () => {
  return (
    <div className="command-container">
      <Switch>
        <Route path={`/command/${CATEGORY.BOT.ID}`} component={Bot} />
        <Route path={`/command/${CATEGORY.UTILITY.ID}`} component={Utility} />
        <Route path={`/command/${CATEGORY.SEARCH.ID}`} component={Search} />
        <Route path={`/command/${CATEGORY.SOUND.ID}`} component={Sound} />
        <Route path={`/command/${CATEGORY.HISTORY.ID}`} component={History} />
        <Route path={`/command/${CATEGORY.STEAM.ID}`} component={Steam} />
        <Route path={`/command/${CATEGORY.ICON.ID}`} component={Icon} />
        <Route path="/command/*" component={NotFound} />
      </Switch>
    </div>
  )
}

export default Command;
