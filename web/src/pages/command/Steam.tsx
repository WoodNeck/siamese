import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";
import EmbedHeader from "../../component/embed/EmbedHeader";
import EmbedFooter from "../../component/embed/EmbedFooter";
import EmbedField from "../../component/embed/EmbedField";
import EmbedMenu from "../../component/embed/EmbedMenu";

import * as STEAM from "~/const/command/steam";
import * as EMOJI from "~/const/emoji";

const Steam = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
    <CommandItem command={STEAM.PROFILE} parent={STEAM.STEAM}>
      <ChatContainer>
        <ChatBubble position="right">샴 스팀 프로필 WoodNeck</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>WoodNeck</div>
          <EmbedField title="유저 정보" text={<><div>🇰🇷</div><div>LEVEL - 72</div><div>게임 - 1913개</div></>}/>
          <EmbedField title="최근 플레이 게임 (지난 2주간)" text="• 고양이 낙원 - 113.5시간" />
          <EmbedFooter image="https://images-ext-1.discordapp.net/external/1f_R4CatEN7peDuRS10JSuqTkc-jPnW8KGm4iOo_UUQ/https/upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" text="2010년 4월에 가입" />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>해당 사용자의 스팀 프로필 정보를 요약해서 표시합니다.</div>
        <div>스팀 커뮤니티 ID는 사용자 프로필에서 우클릭 {"->"} URL복사를 통해 확인하실 수 있습니다.</div>
        <div>예) https://steamcommunity.com/id/woodneck {"=>"} "woodneck"</div>
        <div>예2) https://steamcommunity.com/profiles/12345678901234567 {"=>"} "12345678901234567"</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={STEAM.RANDOM} parent={STEAM.STEAM}>
      <ChatContainer>
        <ChatBubble position="right">샴 스팀 랜덤 WoodNeck</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <EmbedHeader author={{ avatar: "https://images-ext-2.discordapp.net/external/Gk53Fo4pzLLTD4xClBFtVWUjfEid88YgIAYbmZ3_FNo/http/media.steampowered.com/steamcommunity/public/images/apps/224480/a2def5192d16c9a997dfff6d4f1febcd28ee83f9.jpg", name: "Octodad: Dadliest Catch" }} />
          <div>총 플레이 시간: 8.8시간</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>해당 사용자의 계정에서 무작위 게임을 가져와 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={STEAM.LIBRARY} parent={STEAM.STEAM}>
      <ChatContainer>
        <ChatBubble position="right">샴 스팀 라이브러리 WoodNeck</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>WoodNeck</div>
          <div>{EMOJI.VIDEO_GAME} Atlas Reactor - 438.9시간</div>
          <div>{EMOJI.VIDEO_GAME} Team Fortress 2 - 436.5시간</div>
          <div>{EMOJI.VIDEO_GAME} Killing Floor 2 - 223.3시간</div>
          <div>{EMOJI.VIDEO_GAME} Dota 2 - 196.1시간</div>
          <div>{EMOJI.VIDEO_GAME} Tom Clancy's The Division - 190.5시간</div>
          <div>{EMOJI.VIDEO_GAME} GameMaker: Studio - 187.4시간</div>
          <div>{EMOJI.VIDEO_GAME} NEKOPARA Vol. 1 - 161.3시간</div>
          <div>{EMOJI.VIDEO_GAME} Terraria - 138.1시간</div>
          <div>{EMOJI.VIDEO_GAME} Aseprite - 126.8시간</div>
          <div>{EMOJI.VIDEO_GAME} FINAL FANTASY XV WINDOWS EDITION - 125.1시간</div>
          <div>1/5</div>
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>사용자 계정의 게임들을 플레이 시간이 높은 것부터 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={STEAM.PLAYERS} parent={STEAM.STEAM}>
      <ChatContainer>
        <ChatBubble position="right">샴 스팀 동접 Nekopara Vol.1</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div><a href="https://cdn.discordapp.com/attachments/817765838001668116/818511043021897748/1472914171_QQ20160902205022noise_scaleLevel1x2.000000.png" target="_blank" rel="noreferrer">Nekopara Vol.1</a></div>
          <div>현재 플레이어 수: 83</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>해당 게임의 현재 접속자 수를 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={STEAM.TOP} parent={STEAM.STEAM}>
      <ChatContainer>
        <ChatBubble position="right">샴 스팀 동접순위</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <EmbedField title="1. Counter-Strike: Global Offensive" text="• 800,857명 / 1,201,993명" />
          <EmbedField title="2. Dota 2" text="• 467,223명 / 650,049명" />
          <EmbedField title="3. PLAYERUNKNOWN'S BATTLEGROUNDS" text="• 330,183명 / 454,613명" />
          <EmbedField title="4. Valheim" text="• 161,027명 / 330,489명" />
          <EmbedField title="5. Apex Legends" text="• 157,783명 / 228,948명" />
          <EmbedFooter image="https://images-ext-1.discordapp.net/external/1f_R4CatEN7peDuRS10JSuqTkc-jPnW8KGm4iOo_UUQ/https/upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png" text="동접순위 (현재 / 최고) • (1/10)" />
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>현재 가장 플레이어 수가 많은 게임을 100개까지 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Steam;
