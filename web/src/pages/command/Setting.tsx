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
    <CommandItem command={SETTING.AUTO_OUT} voiceOnly={true}>
      <ChatContainer>
        <ChatBubble position="right">샴 자동퇴출</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>음성 명령을 재생한 후에도 음성채널에 남아있도록 하겠다냥! 단, 30분 뒤에는 알아서 나간다냥!</div>
        </ChatBubble>
        <ChatBubble position="right">샴 자동퇴출</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>음성 명령을 재생한 후에 바로 음성채널을 나가겠다냥!</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>음성 명령어(tts 등)를 재생한 이후에 샴고양이가 음성 채널에서 바로 나갈지 여부를 설정합니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Setting;
