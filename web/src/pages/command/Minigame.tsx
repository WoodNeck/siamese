import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";

import * as MINIGAME from "~/const/command/minigame";

const Search = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
      <CommandItem command={MINIGAME.OTHELLO}>
      <ChatContainer>
        <ChatBubble position="right">샴 오셀로 [@상대방]</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 오셀로
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>상대방을 지정하거나 기다린 후에 쓰레드 채널 내에서 오셀로(리버시) 게임을 플레이합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={MINIGAME.YACHT}>
      <ChatContainer>
        <ChatBubble position="right">샴 요트 @상대방</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 요트
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>상대방을 지정하거나 기다린 후에 쓰레드 채널 내에서 요트(Yacht) 게임을 플레이합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={MINIGAME.CONNECT4}>
      <ChatContainer>
        <ChatBubble position="right">샴 사목 @상대방</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 사목
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>상대방을 지정하거나 기다린 후에 쓰레드 채널 내에서 사목(Connect 4) 게임을 플레이합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={MINIGAME.TICTACTOE}>
      <ChatContainer>
        <ChatBubble position="right">샴 틱택토 @상대방</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 틱택토
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>상대방을 지정하거나 기다린 후에 쓰레드 채널 내에서 틱택토 게임을 플레이합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={MINIGAME.ONECARD}>
      <ChatContainer>
        <ChatBubble position="right">샴 원카드</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 틱택토
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>플레이를 최대 4명까지 기다린 후에 쓰레드 채널 내에서 원카드 게임을 플레이합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={MINIGAME.LADDER}>
      <ChatContainer>
        <ChatBubble position="right">샴 사다리 당첨항목1 당첨항목2 당첨항목3 ...</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 사다리
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>2~9개 사이의 당첨항목을 띄어쓰기로 구분해서 명령어를 사용하여 사다리 게임을 생성할 수 있습니다.</div>
        <div>당첨항목과 동일한 수만큼 플레이어가 참가한 뒤에 사다리 게임을 시작할 수 있습니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={MINIGAME.ONECARD}>
      <ChatContainer>
        <ChatBubble position="right">샴 마작</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 마작
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>플레이어가 4명이 될 때까지 기다린 후에 쓰레드 채널 내에서 리치마작을 플레이합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={MINIGAME.CONNECT5}>
      <ChatContainer>
        <ChatBubble position="right">샴 오목</ChatBubble>
        <ChatBubble author={siamese} position="left">
          🕹️ 오목
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>상대방을 지정하거나 기다린 후에 쓰레드 채널 내에서 오목을 플레이합니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Search;
