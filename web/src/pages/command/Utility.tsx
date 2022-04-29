import { useSelector } from "react-redux";

import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";
import EmbedFooter from "../../component/embed/EmbedFooter";
import EmbedMenu from "../../component/embed/EmbedMenu";
import Mention from "../../component/command/Mention";

import { RootState } from "../../redux/reducers";
import * as UTILITY from "~/const/command/utility";
import * as EMOJI from "~/const/emoji";

const Utility = () => {
  const user = useSelector((state: RootState) => state.user);
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  const userName = user?.username ?? "USER";

  return <>
    <CommandItem command={UTILITY.DICE}>
      <ChatContainer>
        <ChatBubble position="right">샴 주사위</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div><Mention name={userName} />냥이 주사위를 굴려 {EMOJI.DICE}54가 나왔다냥! (1-100)</div>
        </ChatBubble>
        <ChatBubble position="right">샴 주사위 10000</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div><Mention name={userName} />냥이 주사위를 굴려 {EMOJI.DICE}7409가 나왔다냥! (1-10000)</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>n(기본값: 100)면짜리 주사위를 굴려 결과를 보여드립니다.</div>
        <div>n은 {UTILITY.DICE.MIN}부터 {UTILITY.DICE.MAX}까지 가능합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={UTILITY.CHOOSE}>
      <ChatContainer>
        <ChatBubble position="right">샴 골라줘 이거 요거 저거</ChatBubble>
        <ChatBubble author={siamese} position="left">요거</ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>주어진 항목들 중에 하나를 골라드립니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={UTILITY.SAY}>
      <ChatContainer>
        <ChatBubble position="right">샴 따라해 냥</ChatBubble>
        <ChatBubble author={siamese} position="left">냥</ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>사용자의 명령어 메시지를 삭제한 후, 해당 메시지의 내용을 따라합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={UTILITY.VOTE}>
      <ChatContainer>
        <ChatBubble position="right">샴 투표 오늘 저녁 뭐먹지?</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>투표 항목들을 말해달라냥!</div>
          <div>콤마(,)로 항목들을 구분해서, 최소 2개에서 9개까지 투표 항목들을 말해달라냥!</div>
          <div>예) 옵션1, 옵션2, 옵션3</div>
        </ChatBubble>
        <ChatBubble position="right">🍔, 🍕, 🍜, 🍣, 굶어</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>투표를 몇 분동안 하면 될까냥?</div>
          <div>투표를 종료하기까지 시간을 분 단위로 말해달라냥!</div>
          <div>최소 1분에서 최대 1440분(하루)까지 가능하다냥!</div>
          <div>예) 30</div>
        </ChatBubble>
        <ChatBubble position="right">30</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>투표를 시작한다냥! 번호 이모지를 클릭해서 투표하라냥!</div>
          <div>각자 가장 마지막에 클릭한 이모지가 최종 투표 항목이 된다냥!</div>
          <div>{EMOJI.BALLOT_BOX} 오늘 저녁 뭐먹지?</div>
          <div>1️⃣ 🍔</div>
          <div>2️⃣ 🍕</div>
          <div>3️⃣ 🍜</div>
          <div>4️⃣ 🍣</div>
          <div>5️⃣ 굶어</div>
          <EmbedFooter image={`${user?.avatarURL ?? siamese.avatar}`} text={`${userName}의 투표 (⏱️30m)•오늘 오후 3:51`}></EmbedFooter>
          <EmbedMenu items={[{ emoji: "1️⃣", count: 1 },{ emoji: "2️⃣", count: 1 }, { emoji: "3️⃣", count: 1 }, { emoji: "4️⃣", count: 1 }, { emoji: "5️⃣", count: 1 }]} />
        </ChatBubble>
        <ChatBubble author={siamese} position="left">
          🍔가 5표로 가장 높은 표를 기록했다냥!
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>해당 채널 내에서 무기명 투표를 시작합니다.</div>
        <div>투표 옵션은 최소 2개에서 최대 9개까지 가능합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={UTILITY.AVATAR}>
      <ChatContainer>
        <ChatBubble position="right">샴 아바타 <Mention name={userName} /></ChatBubble>
        <ChatBubble author={siamese} position="left">
          <img className="user-avatar" src={user?.avatarURL ?? "https://cdn.discordapp.com/embed/avatars/0.png"} />
          <EmbedFooter image={`${user?.avatarURL ?? siamese.avatar}`} text={userName}></EmbedFooter>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>멘션한 유저의 아바타를 큰 사이즈로 보여줍니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={UTILITY.TRANSLATE}>
      <ChatContainer>
        <ChatBubble position="right">샴 번역 Hello</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>{EMOJI.MEMO} 안녕하세요</div>
          <div>{EMOJI.WWW} 영어: Hello</div>
        </ChatBubble>
        <ChatBubble position="right">샴 번역 프랑스어 안녕하세요</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>{EMOJI.MEMO} salut</div>
          <div>{EMOJI.WWW} 한국어: 안녕하세요</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>주어진 문장을 한국어로 번역합니다.</div>
        <div>반대로, 번역할 언어가 주어졌을 경우 한국어 문장을 해당 언어로 번역합니다.</div>
        <details>
          <summary>번역 가능한 언어 목록</summary>
          <ol>{ Object.keys(UTILITY.TRANSLATE.LANGS).map(lang => (
            <li key={lang} className="little-tag">{lang}</li>
          )) }</ol>
        </details>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={UTILITY.TRANSLATE.LIST} parent={UTILITY.TRANSLATE}>
      <ChatContainer>
        <ChatBubble position="right">샴 번역 목록</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>{ Object.keys(UTILITY.TRANSLATE.LANGS).slice(0, 10).map(lang => (
            <div key={lang}>{EMOJI.SMALL_WHITE_SQUARE} {lang}</div>
          )) }</div>
          <div>1/5</div>
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        번역 가능한 언어 목록을 표시합니다.
      </CommandDesc>
    </CommandItem>
    <CommandItem command={UTILITY.SPELLING}>
      <ChatContainer>
        <ChatBubble position="right">샴 맞춤법 왜않된데?</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>📝 교정 결과다냥!</div>
          <div>왜 안 된대?</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        번역 가능한 언어 목록을 표시합니다.
      </CommandDesc>
    </CommandItem>
  </>
}

export default Utility;
