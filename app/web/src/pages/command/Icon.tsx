import { Link } from "react-router-dom";

import CommandItem from "../../component/command/CommandItem";
import CommandInfo from "../../component/command/CommandInfo";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";
import EmbedHeader from "../../component/embed/EmbedHeader";
import EmbedMenu from "../../component/embed/EmbedMenu";
import Mention from "../../component/command/Mention";

import * as ICON from "~/const/command/icon";
import * as EMOJI from "~/const/emoji";

const Icon = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
    <CommandInfo title="아이콘이란?">
      <ChatContainer>
        <ChatBubble position="right">~케장 그렇군요</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <EmbedHeader author={{
            name: "USER",
            avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
          }} />
          <img src="https://cdn.discordapp.com/attachments/817765838001668116/820596279734304768/c1e2f05c7e12b6be.png" />
        </ChatBubble>
      </ChatContainer>
      <div style={{ marginTop: "20px" }}>
        <CommandDesc>
          <div style={{ color: "#000" }}>아이콘은 접두사(~)에 이미지 이름을 붙여 메시지를 보내면 샴고양이가 메시지를 이미지로 변환시켜주는 기능입니다.</div>
        </CommandDesc>
        <div style={{ fontSize: "1.5em" }}>사용법</div>
        <div>~[아이콘 그룹명] [아이콘 이름]</div>
        <div>~[아이콘 이름] (그룹이 없는 경우)</div>
        <hr />
        <div><Link to="/icon" style={{ fontSize: "1.5em" }}>아이콘 관리 페이지</Link></div>
        <hr />
        <div>이미지를 디스코드 서버에 저장하기 때문에, 최대 8MB까지의 이미지들만 업로드 가능합니다.</div>
      </div>
    </CommandInfo>
    <CommandItem command={ICON.ICON}>
      <ChatContainer>
        <ChatBubble position="right">샴 아이콘</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <a href="https://woodneck.github.io/siamese/#/icon">
            {EMOJI.LINK} 샴고양이 개발 서버의 아이콘 관리 페이지다냥!
          </a>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>아이콘 관리 페이지 링크를 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={ICON.ADD} parent={ICON.ICON}>
      <ChatContainer>
        <ChatBubble position="right">
          <img src={siamese.avatar} className="bot-avatar" />
          <div>샴 아이콘 추가해줘 샴고양이</div>
        </ChatBubble>
        <ChatBubble author={siamese} position="left">
          샴고양이를 추가했다냥!
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>새로운 아이콘을 추가합니다.</div>
        <img src="https://cdn.discordapp.com/attachments/805419701386739722/805419755497848862/icon_add.png" />
        <div>위와 같이 이미지를 업로드하면서 명령어를 같이 입력하셔야 합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={ICON.REMOVE} parent={ICON.ICON}>
      <ChatContainer>
        <ChatBubble position="right">샴 아이콘 삭제해줘 샴고양이</ChatBubble>
        <ChatBubble author={siamese} position="left">
          샴고양이를 삭제했다냥!
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>기존 아이콘을 삭제합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={ICON.LIST} parent={ICON.ICON}>
      <ChatContainer>
        <ChatBubble position="right">샴 아이콘 목록</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>{EMOJI.FILE} 고양</div>
          <div>{EMOJI.FILE} 케장</div>
          <div>{EMOJI.PICTURE} 샴고양이</div>
          <div>1/1</div>
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>현재 서버의 아이콘 목록을 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={ICON.ROLE} parent={ICON.ICON}>
      <ChatContainer>
        <ChatBubble position="right">샴 아이콘 역할설정 <Mention name="dev" /></ChatBubble>
        <ChatBubble author={siamese} position="left">
          이제 서버 관리자랑 <Mention name="dev" />만 아이콘을 관리할 수 있다냥!
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>아이콘을 관리할 수 있는 역할을 설정합니다.</div>
        <div>설정하지 않을 경우, 서버의 모든 사람이 아이콘을 관리할 수 있습니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Icon;
