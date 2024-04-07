import { COLOR } from "@siamese/color";
import { CommandContext, SubCommand } from "@siamese/core";
import { TTSConfig, type TTSConfigDocument } from "@siamese/db";
import { EmbedBuilder } from "@siamese/embed";
import { SelectMenuBuilder } from "@siamese/select";
import { range } from "@siamese/util";

import { TTS_FLAG, TTS_VOICES } from "../../../const/voices";
import { TTS_SETTINGS } from "../const";

import type { StringSelectMenuInteraction } from "discord.js";

class TTSSettings extends SubCommand {
  public override define() {
    return {
      data: TTS_SETTINGS,
      sendTyping: false,
      ephemeral: true
    };
  }

  public override async execute({ ctx, getUser }: CommandContext) {
    const userConfig = await TTSConfig.findOrCreate(getUser().id);

    await Promise.all([
      this._sendVoiceMenu(ctx, userConfig),
      this._sendConfigMenu(ctx, userConfig),
      this._sendEmotionMenu(ctx, userConfig)
    ]);
  }

  private async _sendVoiceMenu({ sender, getUser }: CommandContext, userConfig: TTSConfigDocument) {
    const user = getUser();
    const voiceEmbed = new EmbedBuilder({
      title: TTS_SETTINGS.SPEAKER_SELECT_TITLE,
      description: TTS_SETTINGS.SPEAKER_SELECT_DESC,
      color: COLOR.BOT
    });

    const voiceSelect = await sender.sendObject({
      embeds: [voiceEmbed.build()],
      components: this._getVoiceMenus(userConfig.speaker).build()
    });

    await voiceSelect.watchMenuSelect({
      filter: interaction => interaction.user.id === user.id,
      maxWaitTime: TTS_SETTINGS.MAX_LISTEN_TIME,
      onCollect: async ({
        sender: responseSender,
        interaction
      }) => {
        const newSpeaker = (interaction as StringSelectMenuInteraction).values[0];
        await responseSender.editObject({
          components: this._getVoiceMenus(newSpeaker).build()
        });
        await TTSConfig.changeSpeaker(user.id, newSpeaker);
      }
    });

    // 종료
    await voiceSelect.editObject({
      components: []
    });
  }

  private async _sendConfigMenu({ sender, getUser }: CommandContext, userConfig: TTSConfigDocument) {
    const user = getUser();
    const configEmbed = new EmbedBuilder({
      title: TTS_SETTINGS.CONFIG_SELECT_TITLE,
      description: TTS_SETTINGS.CONFIG_SELECT_DESC,
      color: COLOR.BOT
    });

    const configSelect = await sender.sendObject({
      embeds: [configEmbed.build()],
      components: this._getConfigMenus(userConfig).build()
    });

    await configSelect.watchMenuSelect({
      filter: interaction => interaction.user.id === user.id,
      maxWaitTime: TTS_SETTINGS.MAX_LISTEN_TIME,
      onCollect: async ({
        sender: responseSender,
        interaction
      }) => {
        const type = interaction.customId;
        const value = parseFloat((interaction as StringSelectMenuInteraction).values[0]);

        const newConfig = await TTSConfig.updateValue(user.id, type, value);
        if (!newConfig) return;

        await responseSender.editObject({
          components: this._getConfigMenus(newConfig).build()
        });
      }
    });

    // 종료
    await configSelect.editObject({
      components: []
    });
  }

  private async _sendEmotionMenu({ sender, getUser }: CommandContext, userConfig: TTSConfigDocument) {
    const user = getUser();
    const emotionEmbed = new EmbedBuilder({
      title: TTS_SETTINGS.EMOTION_SELECT_TITLE,
      description: TTS_SETTINGS.EMOTION_SELECT_DESC,
      color: COLOR.BOT
    });

    const emotionSelect = await sender.sendObject({
      embeds: [emotionEmbed.build()],
      components: this._getEmotionMenus(userConfig).build()
    });

    await emotionSelect.watchMenuSelect({
      filter: interaction => interaction.user.id === user.id,
      maxWaitTime: TTS_SETTINGS.MAX_LISTEN_TIME,
      onCollect: async ({
        sender: responseSender,
        interaction
      }) => {
        const type = interaction.customId;
        const value = parseFloat((interaction as StringSelectMenuInteraction).values[0]);

        const newConfig = await TTSConfig.updateValue(user.id, type, value);
        if (!newConfig) return;

        await responseSender.editObject({
          components: this._getEmotionMenus(newConfig).build()
        });
      }
    });

    // 종료
    await emotionSelect.editObject({
      components: []
    });
  }

  private _getVoiceMenus(defaultSpeaker: string) {
    const builder = new SelectMenuBuilder();

    const voiceMenu = builder.addStringMenu();

    voiceMenu.addOption(TTS_VOICES.map(voice => ({
      label: voice.name,
      description: voice.type,
      value: voice.value,
      emoji: TTS_FLAG[voice.lang],
      default: voice.value === defaultSpeaker
    })));

    return builder;
  }

  private _getConfigMenus(config: TTSConfigDocument) {
    const builder = new SelectMenuBuilder();

    const volumeMenu = builder.addStringMenu({ id: TTS_SETTINGS.ID.VOLUME });
    volumeMenu.addOption(range(11).map(val => {
      // -5 ~ +5
      // -5: 0.5배
      // +5: 1.5배
      const volume = val - 5;
      const volumeScale = 1 + 0.1 * volume;

      return {
        label: TTS_SETTINGS.VOLUME_LABEL(volumeScale),
        description: TTS_SETTINGS.VOLUME_DESC(volumeScale),
        value: volume.toString(),
        default: volume === config.volume
      };
    }));

    const speedMenu = builder.addStringMenu({ id: TTS_SETTINGS.ID.SPEED });
    speedMenu.addOption(range(11).map(val => {
      // -5 ~ +5
      // -5: 2배 빠른 속도
      // +5: 0.5배 더 느린 속도
      const speed = val - 5;

      // 2^n을 사용하므로 사실 정확한 값은 아님, 하지만 오차를 감안하고 더 이해하기 쉬운 값을 사용
      const speedScale = speed <= 0
        ? 1 - 0.2 * speed
        : 1 - 0.1 * speed;

      return {
        label: TTS_SETTINGS.SPEED_LABEL(speedScale),
        description: TTS_SETTINGS.SPEED_DESC(speedScale),
        value: speed.toString(),
        default: speed === config.speed
      };
    }));

    const pitchMenu = builder.addStringMenu({ id: TTS_SETTINGS.ID.PITCH });
    pitchMenu.addOption(range(11).map(val => {
      // -5 ~ +5
      // -5: 1.2배 높은 피치
      // +5: 0.8배 낮은 피치
      const pitch = val - 5;
      const pitchScale = 1 - pitch * 0.04;

      return {
        label: TTS_SETTINGS.PITCH_LABEL(pitchScale),
        description: TTS_SETTINGS.PITCH_DESC(pitchScale),
        value: pitch.toString(),
        default: pitch === config.pitch
      };
    }));

    const alphaMenu = builder.addStringMenu({ id: TTS_SETTINGS.ID.ALPHA });
    alphaMenu.addOption(range(11).map(val => {
      // -5 ~ +5
      const alpha = val - 5;

      return {
        label: TTS_SETTINGS.ALPHA_LABEL(alpha),
        description: TTS_SETTINGS.ALPHA_DESC(alpha),
        value: alpha.toString(),
        default: alpha === config.alpha
      };
    }));

    const endPitchMenu = builder.addStringMenu({ id: TTS_SETTINGS.ID.END_PITCH });
    endPitchMenu.addOption(range(11).map(val => {
      const endPitch = val - 5;

      return {
        label: TTS_SETTINGS.END_PITCH_LABEL(endPitch),
        description: TTS_SETTINGS.END_PITCH_DESC(endPitch),
        value: endPitch.toString(),
        default: endPitch === config.endPitch
      };
    }));

    return builder;
  }

  private _getEmotionMenus(config: TTSConfigDocument) {
    const builder = new SelectMenuBuilder();

    const emotionMenu = builder.addStringMenu({ id: TTS_SETTINGS.ID.EMOTION });
    emotionMenu.addOption(TTS_SETTINGS.EMOTION_LEVELS.map((label, level) => {
      return {
        label,
        description: TTS_SETTINGS.EMOTION_DESC(label),
        value: level.toString(),
        default: level === config.emotion
      };
    }));

    const emotionStrengthMenu = builder.addStringMenu({ id: TTS_SETTINGS.ID.EMOTION_STRENGTH });
    emotionStrengthMenu.addOption(TTS_SETTINGS.EMOTION_STRENGTHES.map((label, level) => {
      return {
        label,
        description: TTS_SETTINGS.EMOTION_STRENGTH_DESC(label),
        value: level.toString(),
        default: level === config.emotionStrength
      };
    }));

    return builder;
  }
}

export default TTSSettings;
