import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";
import EmbedFooter from "../../component/embed/EmbedFooter";
import EmbedField from "../../component/embed/EmbedField";
import EmbedMenu from "../../component/embed/EmbedMenu";
import Warn from "../../component/command/Warn";

import * as SEARCH from "~/const/command/search";
import * as EMOJI from "~/const/emoji";

const Search = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
      <CommandItem command={SEARCH.SEARCH}>
      <ChatContainer>
        <ChatBubble position="right">샴 검색 샴고양이</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>샴(고양이) - 나무위키</div>
          <div>2021년 2월 18일 ... 샴 고양이 (Siamese Cat)는 태국 원산의 고양이의 한 종류이다.</div>
          <div>2. 기원[편집]. 샴은 태국에서 자연 발생한 종으로 흔히 태국 왕가의 고양이 품종 ...</div>
          <div>나무위키 • (1/10)</div>
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>구글 검색 결과를 최대 10개까지 보여드립니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SEARCH.IMAGE}>
      <ChatContainer>
        <ChatBubble position="right">샴 이미지 샴고양이</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <img className="bot-avatar" src={siamese.avatar} />
          <div>1/9</div>
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>구글 이미지 검색 결과를 최대 10개까지 보여드립니다.</div>
        <Warn>
          후방주의 채널에서 사용시 세이프서치를 사용하지 않습니다.
        </Warn>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SEARCH.YOUTUBE}>
      <ChatContainer>
        <ChatBubble position="right">샴 유튜브 샴고양이</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div><a href="https://youtu.be/6NoVVJYH2S4" target="_blank" rel="noreferrer">https://youtu.be/6NoVVJYH2S4</a></div>
          <img className="bot-avatar" src="https://lh3.googleusercontent.com/z6Sl4j9zQ88oUKNy0G3PAMiVwy8DzQLh_ygyvBXv0zVNUZ_wQPN_n7EAR2By3dhoUpX7kTpaHjRPni1MHwKpaBJbpNqdEsHZsH4q" />
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>유튜브 검색 결과를 최대 10개까지 보여드립니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SEARCH.KIN}>
      <ChatContainer>
        <ChatBubble position="right">샴 지식인 샴고양이</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <EmbedField title="샴 고양이" text="안녕하세요, 샴 고양이 키우고 싶어 하는데 샴 고양이 주의 할 점이랑 샴 고양이가 좋아하는 음식,장난감 등 꿀팁 좀... 샴고양이도 일반 고양이랑 별로 다른게 없읍니다. 그저 있다면 사람을 더 좋아하는 온순한 애교냥이에..." />
          <EmbedField title="샴고양이와 키우기 좋은 종" text="안녕하세요 현재 샴고양이를 키우고 있는데 제가 일 다닐때 애기가 많이 우울해하는거같아서 스코티쉬폴드를... 그래서 이번에 폴드는 아는 지인분께 무료분양드리고 다른 고양이를 찾고있는데 혹시 샴고양이와 잘맞는 고양이 종이..." />
          <EmbedField title="샴 고양이 어디가 아픈걸까요" text="5살 샴 고양이를 키우고있어요 근데 고양이가 마시는 물 그릇에 이렇게 뿌옇게 뭐가 있어요. 어디가 아픈걸까요..ㅠ (사료그릇이랑 물그릇을 나란히 두는게 아니여서 사료가 물그릇에 빠진건 아니에요 단순히 사진속의 뿌연거만 보고 뭔지..." />
          <div>1/10</div>
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>네이버 지식인 검색 결과를 최대 10개까지 보여드립니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SEARCH.CHEAPEST}>
      <ChatContainer>
        <ChatBubble position="right">샴 최저가 Nekopara Vol.1</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>NEKOPARA Vol. 1</div>
          <div>{EMOJI.DOLLAR} 9.99$</div>
          <EmbedFooter
            image="https://images-ext-1.discordapp.net/external/PAeHsdFwI_DE_DXWVIHYDOCeuNWS4D0CFky4EJkZFvc/https/www.cheapshark.com/img/reviews/positive.png"
            text="압도적으로 긍정적 - 전체 사용자 평가 18988건 중 96%가 긍정적이다냥! • (1/1)"
          />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div><a href="https://cheapshark.com" target="_blank" rel="noreferrer">cheapshark.com</a>에서 게임 최저가를 검색합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SEARCH.SHOPPING}>
      <ChatContainer>
        <ChatBubble position="right">샴 쇼핑 고양이 사료</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div><a href="https://search.shopping.naver.com/search/all?query=%EA%B3%A0%EC%96%91%EC%9D%B4%20%EC%82%AC%EB%A3%8C&frm=NVSHATC" target="_blank" rel="noreferrer">고양이 전연령 사료</a></div>
          <div>• 최저 5870원 ~ 133200원</div>
          <EmbedFooter
            image="https://images-ext-1.discordapp.net/external/r_tAvWWzO30Pppmuvj-Dw2F0ROoZxJWpmo3ytOCQc9I/%3F1/https/www.naver.com/favicon.ico"
            text="네이버 - 일반상품 • (1/10)"
          />
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>네이버 쇼핑의 검색 결과를 보여드립니다.</CommandDesc>
    </CommandItem>
    <CommandItem command={SEARCH.STOCK}>
      <ChatContainer>
        <ChatBubble position="right">샴 주식 네이버</ChatBubble>
        <ChatBubble author={siamese} position="left">
        <img src={`${process.env.PUBLIC_URL}/command/stock.png`} />
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>주식/증권 검색 결과를 보여드립니다.</CommandDesc>
    </CommandItem>
    <CommandItem command={SEARCH.COIN}>
      <ChatContainer>
        <ChatBubble position="right">샴 코인 도지</ChatBubble>
        <ChatBubble author={siamese} position="left">
        <img src={`${process.env.PUBLIC_URL}/command/coin.png`} />
          <EmbedMenu items={[{ emoji: EMOJI.ARROW_LEFT, count: 1 },{ emoji: EMOJI.ARROW_RIGHT, count: 1 }, { emoji: EMOJI.CROSS, count: 1 }]} />
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>가상화폐 검색 결과를 보여드립니다.</CommandDesc>
    </CommandItem>
  </>
}

export default Search;
