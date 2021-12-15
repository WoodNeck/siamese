/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from "axios";

export default () => {
  axios.defaults.headers.common["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36 Edg/96.0.1054.53";
  axios.defaults.headers.common["Accept-Language"] = "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7";
};
