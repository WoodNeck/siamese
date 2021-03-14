import CommandItem from "../../component/command/CommandItem";
import ChatBubble from "../../component/command/ChatBubble";
import ChatContainer from "../../component/command/ChatContainer";
import CommandDesc from "../../component/command/CommandDesc";

import * as SOUND from "~/const/command/sound";
import * as EMOJI from "~/const/emoji";

const Sound = () => {
  const siamese = {
    name: "샴고양이",
    avatar: `${process.env.PUBLIC_URL}/logo20.png`
  };
  window.scrollTo(0, 0);

  return <>
    <CommandItem command={SOUND.TTS} voiceOnly={true}>
      <ChatContainer>
        <ChatBubble position="right">샴 tts 안뇽안뇽</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>{EMOJI.MUSIC_NOTE}</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>주어진 문장을 사용자가 참가한 음성 채널에서 읽어드립니다.</div>
      </CommandDesc>
    </CommandItem>
    <CommandItem command={SOUND.OUT} voiceOnly={true}>
      <ChatContainer>
        <ChatBubble position="right">샴 나가</ChatBubble>
        <ChatBubble author={siamese} position="left">
          <div>{EMOJI.GREEN_CHECK}</div>
        </ChatBubble>
      </ChatContainer>
      <CommandDesc>
        <div>샴고양이가 재생하던 내용을 정지하고 참가한 음성채널에서 나갑니다.</div>
      </CommandDesc>
    </CommandItem>
  </>
}

export default Sound;
