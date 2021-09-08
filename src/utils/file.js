const fs = require('fs');

function writeFile(path, data) {

  if (typeof data === 'object' && data !== null) {
    data = JSON.stringify(data)
  }

  fs.writeFile(path, data, function (err) {
    if (err) { throw err; }
  });
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', function (err, data) {
      if (err) {
        console.log(err);
        resolve(null)
      }
      resolve(data)
    });
  });
}

module.exports = {
  writeFile, readFile
}