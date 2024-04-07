
import type Bot from "../Bot";
import type Command from "../Command";
import type Usage from "../usage/Usage";
import type { UsageOptionType } from "../usage/UsageOptionType";
import type { MessageSender } from "@siamese/sender";
import type { Channel, Guild, User } from "discord.js";

abstract class CommandContext {
  public abstract sender: MessageSender;

  /**
   * 봇의 이름을 반환
   * 서버 내부에서 수행한 명령어였을 경우, 서버 내에서 표시되는 이름을 반환
   */
  public abstract getBotName: () => string;
  /**
   * 명령어가 서버에서 수행된 것인지 여부를 반환
   */
  public abstract inGuild: () => boolean;
  /**
   * 명령어가 후방주의 채널에서 수행된 것인지 여부를 반환
   */
  public abstract inNSFWChannel: () => boolean;
  /**
   * 명령어를 실행한 유저를 반환
   */
  public abstract getUser: () => User;
  /**
   * 명령어가 수행된 채널을 반환
   */
  public abstract getChannel: () => Promise<Channel>;
  /**
   * 명령어가 수행된 서버의 ID를 반환
   */
  public abstract getGuildID: () => string | null;
  /**
   * 명령어가 수행된 서버를 반환
   */
  public abstract getGuild: () => Guild | null;
  public abstract getParams: <T extends Usage[]>() => UsageOptionType<T>;
  /**
   * 자기 자신을 리턴, 분해 할당을 통해 사용하기 편하도록
   */
  public get ctx() { return this; }

  public constructor(
    public readonly bot: Bot,
    public readonly command: Command
  ) { }

  protected _getDisplayNameInGuild(guild: Guild, user: User) {
    const userAsMember = guild.members.cache.get(user.id);

    return userAsMember
      ? userAsMember.displayName
      : user.username;
  }
}

export default CommandContext;
