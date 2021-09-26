// functions
const getScreen = require("./src/functions/getScreen.js");
const getOCR = require("./src/functions/getOCR.js");
const getFiles = require("./src/functions/getFiles.js");
const settings = require("./src/functions/settings.js");

// server
const express = require("express");
const app = express();
const port = 1011;
const axios = require("axios");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Health check");
});

app.get("/ocr", async (req, res) => {
  var params = req.query || {};
  try {
    var response = await getOCR(params);
    res.send(response);
  } catch (err) {
    res.statusCode = 400;
    res.send(err);
  }
});

app.get("/files", async (req, res) => {
  try {
    var response = await getFiles();
    res.send(response);
  } catch (err) {
    res.statusCode = 400;
    res.send(err);
  }
});

app.get("/screenshot", async (req, res) => {
  try {
    var params = req.query || {};
    var response = await getScreen(params);
    res.send(response);
  } catch (err) {
    res.statusCode = 400;
    res.send(err);
  }
});

app.get("/settings", async (req, res) => {
  try {
    var params = req.query || null;
    var response = await settings(params);
    res.send(response);
  } catch (err) {
    res.statusCode = 400;
    res.send(err);
  }
});

app.listen(port, () => {
  console.log(`NWGather app listening at http://localhost:${port}`);
});

const coolMessageProcess = async () => {
  var tryCoolMessage = true;
  var res;
  while (tryCoolMessage) {
    try {
      res = await axios.get("http://localhost:1010");
    } catch (err) {
      res = null;
    }
    if (res) {
      var coolMessage = require("./src/functions/coolASCII.js");
      var coolMessageArray = [];
      var columns = 0;
      var lines = 0;
      var toAdd = " ";
      for (var [i, line] of coolMessage.split("\n").entries()) {
        lines++;
        coolMessageArray.push([]);
        for (var [j, character] of line.split("").entries()) {
          coolMessageArray[i].push(character);
          if (j > columns) columns = j;
        }
      }
      for (var column = 0; column <= columns; column++) {
        process.stdout.write("\033c");
        coolMessage = "";
        for (var line = 0; line <= lines; line++) {
          for (var letter = 0; letter <= column; letter++) {
            toAdd = coolMessageArray[line]
              ? coolMessageArray[line][letter]
              : " ";
            coolMessage += toAdd ? toAdd : " ";
          }
          coolMessage += "\n";
        }
        console.log(coolMessage);
        await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 20));
      }
      tryCoolMessage = false;
    }
    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 1000));
  }
};

coolMessageProcess();
