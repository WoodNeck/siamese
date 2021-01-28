/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from "axios";

export default () => {
  axios.defaults.headers.common["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.309 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36";
  axios.defaults.headers.common["Accept-Language"] = "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7";
};
