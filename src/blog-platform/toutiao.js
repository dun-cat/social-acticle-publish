const { saveCoockies, saveLocalStorage, readCookies, readLocalStorage } = require('../browser-cache-handler');
const { writeContentToLocalFile, createBrowser, playActions } = require('../utils/helper');

class TouTiaoBlog {

  async init() {
    const browser = await createBrowser()

    const page = await browser.newPage();

    this.page = page;

    const cookies = await readCookies('toutiao');
    const storage = await readLocalStorage('toutiao');

    // 恢复 cookie
    if (cookies) {
      page.setCookie(...cookies)
    }

    await page.goto('https://mp.toutiao.com/');

    // 恢复 localStorage
    if (storage) {
      await page.evaluate((values) => {
        for (const key in values) {
          if (Object.hasOwnProperty.call(values, key)) {
            localStorage.setItem(key, values[key])
          }
        }
      }, storage);
    }
    return page;
  }

  async waitForLogin() {
    const { page } = this;

    // 登录后，持久化 cookie 和 localstorage

    const selector = '#masterRoot > div > div.garr-header > div > div.shead_right > div.user-panel > div.information > a > span > div';
    const isLogined = await page.waitForSelector(selector).then(() => {

      saveCoockies('toutiao', page).catch((error) => {
        console.log(error)
      });
      saveLocalStorage('toutiao', page).catch((error) => {
        console.log(error)
      });

      return true
    })

    if (isLogined) {
      await page.goto('https://mp.toutiao.com/profile_v4/graphic/publish?from=toutiao_pc')

    }

    return isLogined

  }

  async publish(content) {
    const { page } = this;
    const { body, attributes } = content;
    const { title } = attributes;

    const actionList = [
      {
        name: 'closeSelector',
        selector: 'body > div:nth-child(23) > div.byte-modal-wrapper.zoomModal-appear-done.zoomModal-enter-done > div > div:nth-child(3) > button',
        event: 'click'
      }, {
        name: 'importBtnMarkdownSelector',
        selector: '#root > div > div > div.publish-editor > div.syl-editor-wrap > div > div.ProseMirror',
        event: {
          type: 'type',
          params: body
        }
      }
    ]

    const isSuccess = await playActions(page, actionList)
    console.log(`头条发布状态：${isSuccess ? 'Done' : 'Failed'}`)
  }

}

module.exports = TouTiaoBlog;