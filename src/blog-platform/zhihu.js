const { saveCoockies, saveLocalStorage, readCookies, readLocalStorage } = require('../browser-cache-handler');
const { sequenceExecTask, writeContentToLocalFile, createBrowser } = require('../utils/helper');

class ZhiHuBlog {

  async init() {
    const browser = await createBrowser()

    const page = await browser.newPage();

    this.page = page;

    const cookies = await readCookies('zhihu');
    const storage = await readLocalStorage('zhihu');

    // 恢复 cookie
    if (cookies) {
      page.setCookie(...cookies)
    }

    await page.goto('https://www.zhihu.com/');

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

    const xpath = '//*[@id="Popover15-toggle"]';
    const isLogined = await page.waitForXPath(xpath).then(() => {

      saveCoockies('zhihu', page).catch((error) => {
        console.log(error)
      });
      saveLocalStorage('zhihu', page).catch((error) => {
        console.log(error)
      });

      return true
    })

    if (isLogined) {
      await page.goto('https://zhuanlan.zhihu.com/write')

    }

    return isLogined

  }

  async publish(content) {
    const { page } = this;
    const { body, attributes } = content;
    const { title } = attributes;


    const markdownPath = await writeContentToLocalFile(body);

    const actionList = [
      {
        name: 'titleSelector',
        selector: '#root > div > main > div > div.WriteIndexLayout-main.WriteIndex > div:nth-child(2) > label > textarea',
        event: {
          type: 'type',
          params: title
        }
      }, {
        name: 'publishAlertSelector',
        selector: '#Popover3-toggle',
        event: 'click'
      }, {
        name: 'importBtnMarkdownSelector',
        selector: '#Popover3-content',
        event: 'click'
      }, {
        name: 'importMarkdownSelector',
        selector: '.Editable-docModal input[type=file]',
        event: {
          type: 'uploadFile',
          params: markdownPath
        }
      }, {
        name: 'publishSelector',
        selector: '#root > div > main > div > div.ColumnPageHeader-Wrapper > div > div > div > div.ColumnPageHeader-Button > div.PublishPanel-wrapper',
        event: 'click',
        delay: 6000
      }, {
        name: 'publishSelector',
        selector: '#root > div > main > div > div.ColumnPageHeader-Wrapper > div > div > div > div.ColumnPageHeader-Button > div.PublishPanel-wrapper > div > div > div.PublishPanel-stepOneButton > button',
        event: 'click'
      }
    ]


    const actionsPromises = actionList.map(({ name, selector, event, xpath, delay }) => {
      return () => new Promise(async (resolve, reject) => {
        let handle;
        if (selector) {
          await page.waitForSelector(selector)
          handle = await page.$(selector)
        } else {
          handle = await page.$x(xpath)[0]
        }

        if (delay) {
          await page.waitForTimeout(delay)
        }


        if (typeof event === 'string') {
          await handle[event]()
        } else if (typeof event === 'object' && event !== null) {
          await handle[event.type](event.params)
        }

        resolve(true)
      }).catch(err => {
        console.log(err)
      })
    })

    const isSuccess = await sequenceExecTask(actionsPromises)
    console.log(`知乎发布状态：${isSuccess ? 'Done' : 'Failed'}`)
  }

}

module.exports = ZhiHuBlog;