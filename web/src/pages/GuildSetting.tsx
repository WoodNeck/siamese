import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Switch, useRadioState } from "pretty-checkbox-react";

import NotFound from "./NotFound";
import { RootState } from "../redux/reducers";
import SettingHeader from "../component/SettingHeader";

import { BOT_INVITE_LINK } from "../const";

import "./GuildSetting.css";
import "@djthoms/pretty-checkbox";

const GuildSetting: React.FC = () => {
  const guilds = useSelector((state: RootState) => state.guilds);
  const user = useSelector((state: RootState) => state.user);
  const { guildID, groupID } = useParams<{ guildID: string, groupID?: string }>();
  const guild = guilds.find(guild => guild.id === guildID)!;
  const ttsState = useRadioState({ state: true }) as { state: string | boolean | any[], setState: React.Dispatch<React.SetStateAction<string | boolean | any[] | undefined>> };

  if (!guild) return <NotFound />
  if (!guild.hasSiamese) {
    return <div>
      <div>샴고양이가 없는 서버입니다!</div>
      <div>먼저 샴고양이를 서버에 <a href={BOT_INVITE_LINK} rel="noreferrer" target="_blank">초대</a>해주세요!</div>
    </div>
  }

  return <div>
    <SettingHeader guild={guild} />
    아직 만드는 중이에용....
  </div>
};

export default GuildSetting;
