const ocr = require("node-tesseract-ocr");

const main = async () => {
  var config = {
    lang: "eng",
    oem: 3,
    psm: 3,
  };
  var text = await ocr.recognize("./src/data/imageCropped.jpg", config);
  console.log(text);
};

main()

// const screenshot = require("screenshot-desktop");
// const fs = require('fs')

// const main = async () => {
//   console.log('ok')
//   var img = await screenshot()
//   fs.writeFileSync('./image_teste.jpg', img)
// };

// // const ocr = require("node-tesseract-ocr");
// // const similarity = require("string-similarity");

// // const commonFixes = async (text) => {
// //   try {
// //     var text_ = text;
// //     if (!text.includes("[") || !text.includes("]")) {
// //       text_ = text.split("\n");
// //       text_ = text_.length == 2 ? text_[1] : text_[text_.length - 2];
// //       var text__, ratio, ratio_;
// //       var validRatio = false;
// //       var i;
// //       for (i = 5; i <= 10; i++) {
// //         text__ = text_.slice(0, i);
// //         ratio = similarity.compareTwoStrings("Position", text__);
// //         ratio_ = similarity.compareTwoStrings("position", text__);
// //         ratio = ratio > ratio_ ? ratio : ratio_;
// //         if (ratio >= 0.7) {
// //           validRatio = true;
// //           break;
// //         }
// //       }
// //       if (!validRatio) return [];
// //       for (i = i; i <= text_.length; i++) {
// //         if (/^\d+$/.test(text_[i])) {
// //           text_ = text_.slice(i, text_.length - 2);
// //           break;
// //         }
// //       }
// //     } else text_ = text_.split("[")[1].split("]")[0];
// //     text_ = text_.split(", ");
// //     if (text_.length != 3) return [];
// //     for (var [numberIndex, number] of text_.entries()) {
// //       number = number
// //         .replace(",", ".")
// //         .replace("(", ".")
// //         .replace(")", ".");
// //       text_[numberIndex] = parseFloat(number);
// //     }
// //     if (text_[0] >= 1000) return text_;
// //     else return [];
// //   } catch (err) {
// //     return [];
// //   }
// // };

// // const main = async () => {
// //   var allTexts = [
// //     "FPS 119.6 - 8.5ms\nosition [8094,271, 4813)693, 60.428]\no",
// //     'FPS 144,4"- 7. 6ins\nPosition [6808.048, 4668,334, 152.625]\no',
// //     "FPS 108.1 - 9.5m\nPosition [8824.876, 4216,102, 135.156]\no",
// //     "FPS 122.6 - 8.5ms\nPosition [8074.589, 4791)801, 66.737]\no",
// //     "FPS 132, Ss\nposition [8255.792, 44057439)0:26 ABA}\no",
// //     "is ,5 = 8.2ns\n_egs1ttdhis[s264.978, Goat), os on)\no",
// //     "Position [8828,365,, 43!\no",
// //     "j EPS: 6\n\n7.4 4 15. 8ni5\nPodition IB fe 505, 4219.466, 141,426)\no",
// //   ];
// //   for (var text of allTexts) console.log(await commonFixes(text));
// // };

// main();
