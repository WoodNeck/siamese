import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";
import EmbedHeader from "../../component/embed/EmbedHeader";
import EmbedMenu from "../../component/embed/EmbedMenu";

import * as GAME from "~/const/command/game";
import * as EMOJI from "~/const/emoji";

const Search = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
    <CommandItem command={GAME.FFXIV.ITEM} parent={GAME.FFXIV}>
      <ChatContainer>
        <ChatBubble position="right">샴 파판 아이템</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <EmbedHeader author={{
            avatar: "https://images-ext-2.discordapp.net/external/wGCcgsj9pgHkg9vjkmgf6m3uOCyjPNENXYuZTM3zBPI/https/image.ff14.co.kr/guide/resources/images/GV5.5/033000/033888.png",
            name: "강하하는 드래곤 서슬발톱"
          }} />
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 }, { emoji: EMOJI.GREEN_CHECK, count: 1 }, { emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>파이널 판타지 14 아이템 정보를 검색합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={GAME.FFXIV.LOG} parent={GAME.FFXIV}>
      <ChatContainer>
        <ChatBubble position="right">샴 파판 로그 타타루</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>대충 로그 내용</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>ko.fflogs.com에서 파이널 판타지 14 유저 로그 정보를 검색합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={GAME.HEARTHSTONE}>
      <ChatContainer>
        <ChatBubble position="right">샴 하스스톤 카드 안녕로봇</ChatBubble>
        <ChatBubble author={siamese} position="left">
          안녕로봇의 발명가는 즉시 땜장이 학교와 땜장이 마을에서 쫓겨났으며, 결국에는 동부 왕국에서 영원히 추방되었습니다.
          <img src="https://d15f34w2p8l1cc.cloudfront.net/hearthstone/0826c562b2c7d620a4511ab88a4dcf6712cfcb842f7e410df4cd7af1cb0797a6.png" />
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 }, { emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>하스스톤 카드를 검색합니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Search;
