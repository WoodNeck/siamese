import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";

import * as SETTING from "~/const/command/setting";

const Setting = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
    <CommandItem command={SETTING.ROLE_RESTRICT.ADD} parent={SETTING.ROLE_RESTRICT}>
      <ChatContainer>
        <ChatBubble position="right">샴 역할제한 추가해줘 @dev</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>@샴고양이를 사용할 수 있는 역할에 @dev를 추가했다냥!</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>봇을 사용할 수 있는 역할 목록에 주어진 역할을 추가합니다.</div>
        <div>샴고양이를 사용할 수 있는 역할이 하나라도 주어졌을 경우, 해당 역할들만 샴고양이 명령어를 사용 가능합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SETTING.ROLE_RESTRICT.LIST} parent={SETTING.ROLE_RESTRICT}>
      <ChatContainer>
        <ChatBubble position="right">샴 역할제한 목록</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>현재 활성화된 역할들이다냥! - @dev</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>현재 봇을 사용할 수 있는 역할들을 표시합니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SETTING.ROLE_RESTRICT.REMOVE} parent={SETTING.ROLE_RESTRICT}>
      <ChatContainer>
        <ChatBubble position="right">샴 역할제한 삭제해줘 @dev</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>@샴고양이를 사용할 수 있는 역할에서 @dev를 제거했다냥!</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>봇을 사용할 수 있는 역할들 목록에서 해당 역할을 제거합니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Setting;
