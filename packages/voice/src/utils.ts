import path from "path";

import { TEMP_DIR_PATH } from "./const";

export const toTempMp3Path = (id: string) => path.resolve(TEMP_DIR_PATH, `${id}.mp3`);
