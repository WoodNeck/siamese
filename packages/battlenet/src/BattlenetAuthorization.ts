import { env } from "@siamese/env";
import axios from "axios";
import { TOKEN_ENDPOINT } from "./const";

interface Authorization {
  access_token: string;
  token_type: string;
  expires_in: number;
  sub: string;
}

class BattlenetAuthorization {
  private static _cached: Authorization | null = null;

  public static async getToken(): Promise<string | null> {
    if (BattlenetAuthorization._cached) {
      return BattlenetAuthorization._cached.access_token;
    }

    const data = new URLSearchParams();
    data.append("grant_type", "client_credentials");

    const res = await axios.post(TOKEN_ENDPOINT, data, {
      auth: {
        username: env.BLIZZARD_ID,
        password: env.BLIZZARD_SECRET
      }
    });

    if (res.status !== 200) return null;

    BattlenetAuthorization._cached = res.data;

    setTimeout(() => {
      BattlenetAuthorization._cached = null;
    }, res.data.expires_in);

    return res.data.access_token;
  }
}

export default BattlenetAuthorization;
