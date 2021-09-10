const { saveCoockies, saveLocalStorage, readCookies, readLocalStorage } = require('../browser-cache-handler');

const { createBrowser } = require('../utils/helper');

class JianShuBlog {


  async init() {
    const browser = await createBrowser();
    this.browser = browser;
    const page = await browser.newPage();

    this.page = page;

    const cookies = await readCookies('jianshu');
    const storage = await readLocalStorage('jianshu');

    // 恢复 cookie
    if (cookies) {
      page.setCookie(...cookies)
    }

    // 恢复 localStorage
    if (storage) {
      await page.goto('https://www.jianshu.com/');
      await page.evaluate((values) => {
        for (const key in values) {
          if (Object.hasOwnProperty.call(values, key)) {
            localStorage.setItem(key, values[key])
          }
        }
      }, storage);
    } else {
      await page.goto('https://www.jianshu.com/sign_in');
    }
    return page;
  }

  async waitForLogin() {
    const { browser } = this;
    const { page } = this;

    if (await page.url() === 'https://www.jianshu.com/') return Promise.resolve(true)

    return new Promise((resolve, reject) => {
      browser.on('targetchanged', target => {
        // 重定向到首页，以此为依据说明登录成功！
        if (target.url() === 'https://www.jianshu.com/') {
          saveCoockies('jianshu', page).catch((error) => {
            console.log(error)
          });
          saveLocalStorage('jianshu', page).catch((error) => {
            console.log(error)
          });
          resolve(true)
        }
      })
    });
  }

  async publish(content) {
    const { page } = this;
    this.content = { body: content.body, title: content.attributes.title };

    const notebook_id = 51186158

    await page.goto(`https://www.jianshu.com/writer#/notebooks/${notebook_id}/`)

    const result = await page.evaluate(async ({ title, body, notebook_id }) => {

      // 创建文章
      const { id } = await fetch(`https://www.jianshu.com/author/notes`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          at_bottom: false,
          notebook_id,
          title
        })
      }).then(data => data.json())

      console.log(id)

      // 更新文章
      await fetch(`https://www.jianshu.com/author/notes/${id}`, {
        method: 'PUT',
        headers: {
          "Accept": "application/json",
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          autosave_control: 3,
          title, id,
          content: body
        })
      })

      // 简书平台，一天只允许发布两次
      // 发布文章
      return fetch(`https://www.jianshu.com/author/notes/${id}/publicize`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          'content-type': 'application/json'
        },
        body: "{}"
      }).then(data => data.json())
    }, {
      title: content.attributes.title,
      body: content.body,
      notebook_id
    });


    if (result.error) {
      console.log(`简书发布状态：Failed`)
      console.log(result.error)
    } else {
      console.log(`简书发布状态：Done`)
      // page.reload()
    }
  }
}

module.exports = JianShuBlog;