import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";
import EmbedHeader from "../../component/embed/EmbedHeader";
import EmbedFooter from "../../component/embed/EmbedFooter";

import * as BOT from "~/const/command/bot";
import * as EMOJI from "~/const/emoji";

const Bot = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
    <CommandItem command={BOT.PING}>
      <ChatContainer>
        <ChatBubble position="right">샴 핑</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>퐁이다냥! 현재 샴고양이 웹소켓 핑 평균은 224.0ms다냥!</div>
          <div>@샴고양이는 15시간 42분 7초동안 일하고 있다냥!</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>봇 테스트용 명령어입니다.</div>
        <div>추가로, 샴고양이의 업타임도 확인할 수 있습니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={BOT.INVITE}>
      <ChatContainer>
        <ChatBubble position="right">샴 초대</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>샴고양이의 초대링크다냥!</div>
          <div><a href="https://discord.com/oauth2/authorize?client_id=357073005819723777&permissions=3238976&scope=bot" target="_blank" rel="noreferrer">{EMOJI.LINK}클릭해서 샴고양이 초대하기</a></div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>샴고양이를 다른 서버에 초대할 수 있는 링크를 반환합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={BOT.HELP}>
      <ChatContainer>
        <ChatBubble position="right">샴 도움</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>{EMOJI.BOT} 봇</div>
          <div>봇과 관련된 정보들을 확인할 수 있다냥!</div>
          <div>{EMOJI.SMALL_BLUE_DIAMOND}도움</div>
          <div>명령어 목록을 보여준다냥!</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>샴고양이의 명령어 목록을 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={BOT.INFO}>
      <ChatContainer>
        <ChatBubble position="right">샴 정보</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <EmbedHeader author={siamese} />
          <div>{EMOJI.UP_TRIANGLE} 서버 수 - 304개</div>
          <div><a href="https://discord.gg/uuSPaYtF8W" target="_blank" rel="noreferrer">{EMOJI.ENVELOPE_WITH_ARROW} 샴고양이 개발 서버</a></div>
          <EmbedFooter text="https://github.com/WoodNeck/siamese" image="https://images-ext-1.discordapp.net/external/J_O7iH5CMe8LDWWhW_Erxi1agpn-uesx6LP0hv0c2Zg/https/github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>샴고양이의 정보를 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Bot;
