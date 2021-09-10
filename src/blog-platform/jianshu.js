const { saveCoockies, saveLocalStorage, readCookies, readLocalStorage } = require('../browser-cache-handler');
const { sequenceExecTask } = require('../utils/helper');

async function injectToDocument(page, text, selector) {
  await page.waitForSelector(selector)
  const eleHandle = await page.$(selector)
  await eleHandle.focus()
  await eleHandle.click()

  await page.keyboard.type(text);

}

class JianShuBlog {

  async init(browser) {
    this.browser = browser;
    const page = await browser.newPage();

    page.on('request', (request) => {
      const reg = new RegExp('/content_api/v1/article_draft/create');
      if (reg.test(request.url())) {
        // console.log(request.postData())
      }
    });

    page.on('response', async (response) => {

      const reg = new RegExp('/author/notes');
      if (reg.test(response.url()) && response.request().method() === 'POST') {

        // console.log(response.url(), await response.text())

        const res = await response.json()

        console.log(res)

        // console.log({
        //   title: this.content.title,
        //   body: this.content.body,
        //   id
        // })

        // await page.evaluate(async ({ title, body, id }) => {
        //   const postData = JSON.stringify({
        //     autosave_control: 3,
        //     title, id,
        //     content: body
        //   })

        //   await fetch(`https://www.jianshu.com/author/notes/${id}`, {
        //     method: 'PUT',
        //     body: postData
        //   })

        //   await fetch(`https://www.jianshu.com/author/notes/${id}/publicize`, {
        //     method: 'POST',
        //     body: "{}"
        //   })

        //   location.reload()

        // }, {
        //   title: this.content.title,
        //   body: this.content.body,
        //   id: "" + res.id
        // });

      }
    });

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

      // 修改文章
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
      console.log(result.error)
    } else {
      console.log('简书：发布成功！')
      page.reload()
    }
  }

}

module.exports = JianShuBlog;