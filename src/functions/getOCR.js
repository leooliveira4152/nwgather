const ocr = require("node-tesseract-ocr");
const similarity = require("string-similarity");

const commonFixes = async (text) => {
  try {
    var text_ = text;
    if (!text.includes("[") || !text.includes("]")) {
      text_ = text.split("\n");
      text_ = text_.length == 2 ? text_[1] : text_[text_.length - 2];
      var text__, ratio, ratio_;
      var validRatio = false;
      var i;
      for (i = 5; i <= 10; i++) {
        text__ = text_.slice(0, i);
        ratio = similarity.compareTwoStrings("Position", text__);
        ratio_ = similarity.compareTwoStrings("position", text__);
        ratio = ratio > ratio_ ? ratio : ratio_;
        if (ratio >= 0.7) {
          validRatio = true;
          break;
        }
      }
      if (!validRatio) return [];
      for (i = i; i <= text_.length; i++) {
        if (/^\d+$/.test(text_[i])) {
          text_ = text_.slice(i, text_.length - 2);
          break;
        }
      }
    } else text_ = text_.split("[")[1].split("]")[0];
    text_ = text_.split(", ");
    if (text_.length != 3) return [];
    for (var [numberIndex, number] of text_.entries()) {
      number = number
        .replace(",", ".")
        .replace("(", ".")
        .replace(")", ".");
      text_[numberIndex] = parseFloat(number);
    }
    if (text_[0] >= 1000) return text_;
    else return [];
  } catch (err) {
    return [];
  }
};

module.exports = async (params = {}) => {
  var coordinates = await new Promise(async (resolve, reject) => {
    try {
      var config = {
        lang: "eng",
        oem: params.oem || 3,
        psm: params.psm || 3,
      };
      var text = await ocr.recognize("./src/data/imageCropped.jpg", config);
      var text_ = text;
      try {
        if (!text.includes("[") || !text.includes("]")) throw "invalid";
        text = text
          .split("[")[1]
          .split("]")[0]
          .split(",");
        if (text.length != 3) throw "invalid";
        for (var [index, word] of text.entries()) {
          if (isNaN(word)) throw "invalid";
          else text[index] = parseFloat(word);
        }
        resolve(text);
      } catch {
        resolve(await commonFixes(text_));
      }
    } catch (err) {
      resolve([]);
    }
  });
  if (coordinates.length != 3) return [];
  else {
    doX = true;
    doY = true;
    while (doX) {
      if (coordinates[0] >= 14000) coordinates[0] = coordinates[0] / 10;
      else doX = false;
    }
    while (doY) {
      if (coordinates[1] >= 10000) coordinates[1] = coordinates[1] / 10;
      else doY = false;
    }
    return coordinates;
  }
};
