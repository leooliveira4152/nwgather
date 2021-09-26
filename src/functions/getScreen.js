const screenshot = require("screenshot-desktop");
const fs = require("fs");
const cropper = require("image-clipper");
const canvas = require("node-canvas");

cropper.configure("canvas", canvas);

module.exports = async (params = {}) => {
  var img = await screenshot();
  var id_ = new Date().getTime();
  var fileName = `./src/data/imageOriginal.jpg`;
  return new Promise((resolve) => {
    fs.writeFile(fileName, img, (err, res) => {
      if (err) throw err;
      else {
        cropper(fileName, function() {
          this.crop(
            parseInt(params.xpos || 1570),
            parseInt(params.ypos || 0),
            parseInt(params.width || 350),
            parseInt(params.height || 40)
          )
            // .resize(100, 100)
            .quality(100)
            .toFile(`./src/data/imageCropped.jpg`, function(res) {
              fs.readFile(`./src/data/imageCropped.jpg`, (err, res) => {
                resolve(res.toString("base64"));
              });
              // resolve(`./data/cache/image${id_}.jpg`);
            });
        });
      }
    });
  });
};
