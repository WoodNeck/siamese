/* eslint-disable @typescript-eslint/naming-convention */
import mongoose from "mongoose";

export interface TTSConfigDocument extends mongoose.Document {
  userID: string;
  speaker: string;
  volume: number;
  speed: number;
  pitch: number;
  emotion: number;
  emotionStrength: number;
  alpha: number;
  endPitch: number;
}

const TTSConfigModel = mongoose.model<TTSConfigDocument>("TTSConfig", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  speaker: { type: String, default: "vara" },
  volume: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  pitch: { type: Number, default: 0 },
  emotion: { type: Number, default: 0 },
  emotionStrength: { type: Number, default: 0 },
  alpha: { type: Number, default: 0 },
  endPitch: { type: Number, default: 0 }
}, {
  id: false
}));

export { TTSConfigModel };
