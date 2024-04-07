import { Collection } from "discord.js";

import type VoiceSession from "./VoiceSession";

export const connections = new Collection<string, VoiceSession>();
