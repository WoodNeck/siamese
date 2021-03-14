import { useSelector } from "react-redux";

import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";
import EmbedHeader from "../../component/embed/EmbedHeader";
import EmbedMenu from "../../component/embed/EmbedMenu";

import { RootState } from "../../redux/reducers";
import * as HISTORY from "~/const/command/history";
import * as EMOJI from "~/const/emoji";

const History = () => {
  const user = useSelector((state: RootState) => state.user);
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
    <CommandItem command={HISTORY.RANDOM}>
      <ChatContainer>
        <ChatBubble position="right">샴 랜덤</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <EmbedHeader author={(user && user.id) ? { name: user.username, avatar: user.avatarURL } : siamese} />
          <div>대충 채널의 예전 메시지 내용</div>
          <a href="https://github.com/WoodNeck/siamese" target="_blank" rel="noreferrer">원본 메시지 {EMOJI.SPEECH_BUBBLE}</a>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>현재 채널의 예전 메시지들 중 하나를 무작위로 가져와 표시합니다.</div>
        <div>메시지는 샴고양이가 서버에 참가한 시점부터 기록되기 때문에, 샴고양이가 참가하기 전 메시지는 가져올 수 없습니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={HISTORY.DISCHARGE}>
      <ChatContainer>
        <ChatBubble position="right">샴 전역일 WN</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>WN의 전역일 정보다냥!</div>
          <div style={{ wordBreak: "break-all" }}>{[...Array(100).keys()].map(() => EMOJI.SPARKLING_HEART)}</div>
          <div>자세한 정보</div>
          <div>공군</div>
          <div>입대일자: 2013년 1월 2일</div>
          <div>전역일자: 2015년 1월 1일</div>
          <div>복무한 날: 729일</div>
          <div>남은 날: 0일</div>
          <div>복무율: 100.0%</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>등록된 전역일 정보를 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={HISTORY.DISCHARGE.ADD} parent={HISTORY.DISCHARGE}>
      <ChatContainer>
        <ChatBubble position="right">샴 전역일 추가해줘 WN</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>WN의  전역일 정보를 추가한다냥!</div>
          <div>먼저, YYYY/MM/DD의 형식으로 입대일을 알려달라냥!</div>
          <div>예) 2013/1/2</div>
        </ChatBubble>
        <ChatBubble position="right">2013/1/2</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>다음으로, 군별을 알려달라냥! 다음 중 하나를 골라달라냥!</div>
          <div>육군, 의경, 해병, 해군, 해경, 의방, 공군, 공익</div>
        </ChatBubble>
        <ChatBubble position="right">공군</ChatBubble>
        <ChatBubble author={siamese} position="left">
          💂 WN의 정보를 추가했다냥!
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>전역일 정보를 새로 추가합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={HISTORY.DISCHARGE.LIST} parent={HISTORY.DISCHARGE}>
      <ChatContainer>
        <ChatBubble position="right">샴 전역일 목록</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>🔹 WN - 2013년 1월 2일</div>
          <div>1/1</div>
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>등록된 전역일 목록을 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={HISTORY.DISCHARGE.REMOVE} parent={HISTORY.DISCHARGE}>
      <ChatContainer>
        <ChatBubble position="right">샴 전역일 삭제해줘 WN</ChatBubble>
        <ChatBubble author={siamese} position="left">
          💂 WN의 전역일 정보를 삭제했다냥!
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>전역일 정보를 삭제합니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default History;
