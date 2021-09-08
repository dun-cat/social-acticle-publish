const { saveCoockies, saveLocalStorage, readCookies, readLocalStorage } = require('../browser-cache-handler');
const { sequenceExecTask } = require('../utils/helper');

async function injectToDocument(page, text, selector) {
  await page.waitForSelector(selector)
  const eleHandle = await page.$(selector)
  await eleHandle.focus()
  await eleHandle.click()

  await page.keyboard.type(text);

}

class JuejinBlog {

  async init(browser) {
    const page = await browser.newPage();


    page.on('request', (request) => {
      // https://api.juejin.cn/content_api/v1/article_draft/create'
      // 'content_api/v1/article/publish'
      const reg = new RegExp('/content_api/v1/article_draft/create');
      if (reg.test(request.url())) {
        // console.log(request.postData())
      }
    });

    page.on('response', async (response) => {

      const reg = new RegExp('/content_api/v1/article_draft/create');
      if (reg.test(response.url())) {
        // console.log(await response.text())
      }
    });

    this.page = page;

    const cookies = await readCookies();
    const storage = await readLocalStorage();

    // 恢复 cookie
    if (cookies) {
      page.setCookie(...cookies)
    }

    await page.goto('https://juejin.cn/');

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

    const xpath = '//*[@id="juejin"]/div[1]/div/header/div/nav/ul/li[4]/div/img';
    const isLogined = await page.waitForXPath(xpath).then(() => {

      saveCoockies(page).catch((error) => {
        console.log(error)
      });
      saveLocalStorage(page).catch((error) => {
        console.log(error)
      });

      return true
    })

    if (isLogined) {
      await page.goto('https://juejin.cn/editor/drafts/new?v=2')

    }

    return isLogined

  }



  async publish(content) {
    const { page } = this;
    const { body, attributes } = content;
    const { title } = attributes;
    const result = await page.evaluate(({ title, body }) => {
      const postData = JSON.stringify({
        "category_id": "0",
        "tag_ids": [],
        "link_url": "",
        "cover_image": "",
        "title": title,
        "brief_content": "",
        "edit_type": 10,
        "html_content": "",
        "mark_content": body
      })
      return fetch('https://api.juejin.cn/content_api/v1/article_draft/create', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: postData
      }).then(data => data.json())
    }, {
      title, body
    });

    // 跳转至草稿
    await page.goto(`https://juejin.cn/editor/drafts/${result.data.id}`)

    // 单击发布按钮
    const actionList = [

      {
        name: 'publishAlertSelector',
        selector: '#juejin-web-editor > div.edit-draft > div > header > div.right-box > div.publish-popup.publish-popup.with-padding > button'
      }, {
        name: 'categorySelector',
        selector: '#juejin-web-editor > div.edit-draft > div > header > div.right-box > div.publish-popup.publish-popup.with-padding.active > div > div:nth-child(2) > div.form-item-content.category-list > div:nth-child(2)'
      },
      {
        name: 'tagAlertSelector',
        selector: '#juejin-web-editor > div.edit-draft > div > header > div.right-box > div.publish-popup.publish-popup.with-padding.active > div > div:nth-child(3) > div.form-item-content > div > div > div > div.byte-select__content-wrap > div'
      }, {
        name: 'tagSelector',
        selector: 'body > div.byte-select-dropdown.byte-select-dropdown--multiple.tag-select-add-margin > div > li:nth-child(2)'
      }, {
        name: 'publishSelector',
        selector: '#juejin-web-editor > div.edit-draft > div > header > div.right-box > div.publish-popup.publish-popup.with-padding.active > div > div.footer > div > button.ui-btn.btn.primary.medium.default'
      }
    ]

    await page.waitForSelector(actionList[0].selector)

    const delay = 1000;
    const actionsPromises = actionList.map(({ name, selector }) => {
      return () => new Promise((resolve, reject) => {
        setTimeout(async () => {
          const handle = await page.$(selector)
          await handle.click()
          resolve()
        }, delay);
      })
    })

    sequenceExecTask(actionsPromises)
  }

}

module.exports = JuejinBlog;