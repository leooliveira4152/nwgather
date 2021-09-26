const fs = require("fs");

const readFiles = async (filename) => {
  return new Promise((resolve) => {
    fs.readFile(filename, (err, res) => {
      if (err) resolve([]);
      else resolve(JSON.parse(res));
    });
  });
};

module.exports = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      fs.readdir("./src/data", async (err, allDir) => {
        if (err) throw err;
        var data = {};
        for (var directory of allDir)
          if (!directory.includes("."))
            data[directory] = new Promise((res) => {
              try {
                var path = `./src/data/${directory}`;
                fs.readdir(path, async (err, files) => {
                  if (err) throw err;
                  var filesData = {};
                  for (var file of files)
                    filesData[file.split(".")[0]] = readFiles(
                      `${path}/${file}`
                    );
                  res(filesData);
                });
              } catch (err) {
                res([]);
              }
            });
        var promises = [];
        Object.keys(data).forEach((key) => {
          promises.push(
            new Promise(async (resolve) => {
              data[key] = await data[key];
              var childPromises = [];
              for (var child of Object.keys(data[key]))
                childPromises.push(
                  new Promise(async (res) => {
                    data[key][child] = await data[key][child];
                    res(data[key][child]);
                  })
                );
              resolve(await Promise.all(childPromises));
            })
          );
        });
        await Promise.all(promises);
        resolve(data);
      });
    } catch (err) {
      reject(err);
    }
  });
};
