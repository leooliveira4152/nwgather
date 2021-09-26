const fs = require("fs");

module.exports = async (update = null) => {
  return new Promise((resolve) => {
    fs.readFile("./settings.ini", { encoding: "utf-8" }, (err, res) => {
      if (err) throw err;
      var settings = {};
      res.split("\n").forEach((line) => {
        line = line.replace(/\r/g, "").split("=");
        if (line.length == 2) settings[line[0].trim()] = line[1].trim();
      });
      if (!update) resolve(settings);
      else {
        for (key of Object.keys(update)) settings[key] = update[key];
        var settingsString = "";
        for (key of Object.keys(settings))
          settingsString += `${key} = ${settings[key]}\n`;
        fs.writeFile("./settings.ini", settingsString, (err, res) => {
          if (err) throw err;
          else resolve(settings);
        });
      }
    });
  });
};
