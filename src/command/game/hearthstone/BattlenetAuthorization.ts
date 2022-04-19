import axios from "axios";

import Siamese from "~/Siamese";
import { BLIZZARD } from "~/const/command/game";

interface Authorization {
  access_token: string;
  token_type: string;
  expires_in: number;
  sub: string;
}

class BattlenetAuthorization {
  public static async getToken(bot: Siamese): Promise<string | null> {
    if (BattlenetAuthorization._cached) {
      return BattlenetAuthorization._cached.access_token;
    }

    const data = new URLSearchParams();
    data.append("grant_type", "client_credentials");

    const res = await axios.post(BLIZZARD.TOKEN_ENDPOINT, data, {
      auth: {
        username: bot.env.BLIZZARD_ID!,
        password: bot.env.BLIZZARD_SECRET!
      }
    });

    if (res.status !== 200) return null;

    BattlenetAuthorization._cached = res.data;

    setTimeout(() => {
      BattlenetAuthorization._cached = null;
    }, res.data.expires_in);

    return res.data.access_token;
  }

  private static _cached: Authorization | null = null;
}

export default BattlenetAuthorization;
