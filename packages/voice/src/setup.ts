import fs from "fs-extra";

import { TEMP_DIR_PATH } from "./const";

// 기존 temp directory(TTS 음성 저장용) 삭제
fs.rmSync(TEMP_DIR_PATH, { recursive: true, force: true });

// temp directory 생성
fs.ensureDirSync(TEMP_DIR_PATH);
