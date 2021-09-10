const { writeFile, readFile } = require('./utils/file');
const path = require('path');
const fse = require('fs-extra');


fse.ensureDirSync(path.resolve(__dirname, `./data/`))

function getCookiePath(platform) {
  const file = path.resolve(__dirname, `./data/${platform}_cookie.json`)
  return file
}

function getLocalStoragePath(platform) {
  const file = path.resolve(__dirname, `./data/${platform}_localstorage.json`)
  return file
}

async function saveCoockies(platform, page) {
  const returnedCookie = await page.cookies();
  writeFile(getCookiePath(platform), returnedCookie)
}

async function saveLocalStorage(platform, page) {
  const localStorageData = await page.evaluate(() => {
    let json = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
  writeFile(getLocalStoragePath(platform), localStorageData)
}

function readCookies(platform) {
  const file = getCookiePath(platform);
  if (!fse.existsSync(file)) return Promise.resolve(null)
  return readFile(file).then(data => JSON.parse(data)).catch(error => {
    console.log(error)
  })
}

function readLocalStorage(platform) {
  const file = getLocalStoragePath(platform);
  if (!fse.existsSync(file)) return Promise.resolve(null)
  return readFile(getLocalStoragePath(platform)).then(data => JSON.parse(data)).catch(error => {
    console.log(error)
  })
}

module.exports = {
  saveCoockies, saveLocalStorage, readCookies, readLocalStorage
}