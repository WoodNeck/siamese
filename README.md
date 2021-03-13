# <img height="40" src="https://user-images.githubusercontent.com/26213435/66034036-6e714f80-e543-11e9-8d08-105e7085b305.png" /> 샴고양이(Siamese)
[![Discord](https://img.shields.io/discord/800248062936612904.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/zxSwN8Z) ![typescript](https://img.shields.io/static/v1.svg?label=&message=TypeScript&color=294E80&style=flat-square&logo=typescript)

[Invite Bot](https://discordapp.com/oauth2/authorize?client_id=357073005819723777&scope=bot&permissions=-1)

Korean Discord bot for multiple purpose.

# Prerequisites
- [Node.js](https://nodejs.org/ko/download/package-manager/) 12+
  - Tested with Node v14.15.4
- [MongoDB](https://www.mongodb.com/)
  - Tested with MongoDB v4.2.12

# Installing
## Linux - ubuntu
Tested on Amazon EC2 Ubuntu 20.4
```sh
sudo apt install make
sudo apt install build-essential
npm i
```
Before run, please fill out the `bot.env` file using `bot.env.preset`.
```sh
# BOT
BOT_TOKEN="YOUR_BOT_TOKEN" # Bot token, see https://discord.com/developers/applications
BOT_DEFAULT_PREFIX="샴 " # Bot's prefix
BOT_ICON_PREFIX="~" # Prefix for icon feature

# BOT_OPTIONAL
BOT_DEV_SERVER_INVITE="https://discord.gg/DMbYYFr" # (Optional) Bot dev server's invite link
BOT_DEV_USER_ID=012345678901234567 # (Optional) Bot developer's Discord ID (Integer), this will allow that user to execute specific dev commands
BOT_DEV_SERVER_ID=012345678901234567 # (Optional) Bot dev server's ID
BOT_LOG_VERBOSE_CHANNEL=012345678901234567 # (Optional) Bot dev server's channel ID to receive bot's verbose messages
BOT_LOG_ERROR_CHANNEL=012345678901234567 # (Optional) Bot dev server's channel ID to receive bot's error messages
BOT_BUG_REPORT_CHANNEL=012345678901234567 # (Optional) Bot dev server's channel ID to receive bug reports
BOT_FEATURE_REQUEST_CHANNEL=012345678901234567 # (Optional) Bot dev server's channel ID to receive feature requests
BOT_GITHUB_URL="https://github.com/WoodNeck/siamese" # (Optional) Github URL

## Discord bot lists
DBL_KEY="SOME_KEY_STRING" # (Optional) Discord bot list's key, see https://top.gg/api/docs

# APIS
## Google
GOOGLE_API_KEY="SOME_KEY_STRING" # (Optional) API key that can be retrieved from https://console.cloud.google.com/apis/credentials. Required for Google & Youtube related commands
GOOGLE_SEARCH_ENGINE_ID="SOME_KEY_STRING" # (Optional) ID that can be retrieved from https://cse.google.com/all. Required for Google & Youtube related commands

## Naver
NAVER_ID="SOME_KEY_STRING" # (Optional) ID that can be retrieved from https://developers.naver.com/apps/#/list. Required for Naver-related commands
NAVER_SECRET="SOME_KEY_STRING" # (Optional) Key that can be retrieved from https://developers.naver.com/apps/#/list. Required for Naver-related commands

## Steam
STEAM_API_KEY="SOME_KEY_STRING" # (Optional) Key that can be retrived from https://steamcommunity.com/dev/apikey. Required for Steam-related commands
```

Also, you have to set env variable `GOOGLE_APPLICATION_CREDENTIALS` to use command tts, which uses Google Cloud Text-to-Speech API

```sh
export GOOGLE_APPLICATION_CREDENTIALS="[PATH_TO_YOUR_JSON]"
```

Check [GCP Docs](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries#client-libraries-install-nodejs) for further information.

Then, run with `npm run start` at project root folder.
