# Tataru(Tataru)
[Bot Invite Link](https://discordapp.com/oauth2/authorize?client_id=357073005819723777&scope=bot&permissions=-1)

#### Dev Server(Click to join)
[![Dev Server](https://discordapp.com/api/guilds/498712729381634058/widget.png?style=banner2)](https://discord.gg/d8r6tDz)

Korean Discord bot for multiple purpose.

한국어 명령어를 받는 디스코드용의 다목적 봇입니다.

# Prerequisites
- Node.js 6.0.0 or newer
- yarn 1.10.1 or newer

# Installing
## Linux
```
yarn install
```

# Contributing
## Pre-commit
This project is using pre-commit hook, to regenerate `.env.preset` file whenever `.env` changes.
```sh
python3 ./dev-utils/env_generate.py
git add .
```

## VS Code
As this project uses module alias(check `package.json`), following option can help with autocomplete in VS Code.

#### Prerequisite
- [Path Autocomplete](https://marketplace.visualstudio.com/items?itemName=ionutvmi.path-autocomplete)

```json
// .vscode/settings.json
"path-autocomplete.pathMappings": {
    "@": "${folder}/src",
}
```
