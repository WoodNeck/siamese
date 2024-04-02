import axios from "axios";
import { parseEnv } from "znv";

import schema from "./schema";

// bun + brotli 사용시 서버가 죽는 오류가 있음
axios.defaults.headers.common["Accept-Encoding"] = "gzip";

const env = parseEnv(process.env, schema);
const isProduction = process.env.NODE_ENV === "production";

export {
  env,
  isProduction
};
