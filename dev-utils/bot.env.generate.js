const fs = require("fs");
const path = require("path");
const readline = require("readline");

const interface = readline.createInterface({
  input: fs.createReadStream(path.resolve(__dirname, "../bot.env")),
  console: false
});

const preset = fs.createWriteStream(path.resolve(__dirname, "../bot.env.preset"));

interface.on("line", line => {
  if (line.startsWith("#")) {
    preset.write(`${line}\n`);
  } else {
    preset.write(`${line.substr(0, line.indexOf("=") + 1)}\n`);
  }
});
