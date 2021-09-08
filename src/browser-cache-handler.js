const { writeFile, readFile } = require('./utils/file');
const path = require('path');

const cookiePath = path.resolve(__dirname, './data/cookie.json')
const localStoragePath = path.resolve(__dirname, './data/localstorage.json')

async function saveCoockies(page) {
  const returnedCookie = await page.cookies();
  writeFile(cookiePath, returnedCookie)
}

async function saveLocalStorage(page) {
  const localStorageData = await page.evaluate(() => {
    let json = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
  writeFile(localStoragePath, localStorageData)
}

function readCookies() {
  return readFile(cookiePath).then(data => JSON.parse(data)).catch(error => {
    console.log(error)
  })
}

function readLocalStorage() {
  return readFile(localStoragePath).then(data => JSON.parse(data)).catch(error => {
    console.log(error)
  })
}

module.exports = {
  saveCoockies, saveLocalStorage, readCookies, readLocalStorage
}