<h6 align="center">이 봇은 2019/09/18부로 더 이상 운영되지 않습니다.</h6>

# 샴고양이(Siamese)
[![Discord Bots](https://discordbots.org/api/widget/status/357073005819723777.svg)](https://discordbots.org/bot/357073005819723777)
[![Dev Server](https://discordapp.com/api/guilds/498712729381634058/widget.png)](https://discord.gg/d8r6tDz)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/740678f4912c4afab3dd179240ffddc4)](https://www.codacy.com/app/WoodNeck/siamese?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=WoodNeck/siamese&amp;utm_campaign=Badge_Grade)

[Invite Bot](https://discordapp.com/oauth2/authorize?client_id=357073005819723777&scope=bot&permissions=-1)

Korean Discord bot for multiple purpose.

# Prerequisites
- [Node.js](https://nodejs.org/ko/download/package-manager/) 9.10.0 or newer
- [yarn](https://yarnpkg.com/lang/en/docs/install/#debian-stable) 1.10.1 or newer
- [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) 4.0.4 or newer

# Installing
## Linux - ubuntu
```sh
sudo apt install ffmpeg
yarn install
```
Before run, please fill out the `bot.env` file using `bot.env.preset`.

Also, you have to set env variable `GOOGLE_APPLICATION_CREDENTIALS` to use command tts, which uses Google Cloud Text-to-Speech API

```sh
export GOOGLE_APPLICATION_CREDENTIALS="[PATH_TO_YOUR_JSON]"
```

Check [GCP Docs](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#client-libraries-install-nodejs) for further information.

Then, run with `node .` at project root folder.
