const { saveCoockies, saveLocalStorage, readCookies, readLocalStorage } = require('./browser-cache-handler');
const { writeContentToLocalFile, createBrowser, playActions } = require('./utils/helper');

class XyPDFDownloader {

  async init() {
    const browser = await createBrowser()

    const page = await browser.newPage();

    this.page = page;

    const cookies = await readCookies('xy');
    const storage = await readLocalStorage('xy');

    // 恢复 cookie
    if (cookies) {
      page.setCookie(...cookies)
    }

    await page.goto('https://oa.xyb2b.com/wui/index.html')



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

    const xpath = '//*[@id="container"]/div/div[2]/div[1]/div/div[2]/div[2]/div[18]';
    const isLogined = await page.waitForXPath(xpath).then(() => {

      saveCoockies('xy', page).catch((error) => {
        console.log(error)
      });
      saveLocalStorage('xy', page).catch((error) => {
        console.log(error)
      });

      return true
    })

    if (isLogined) {
      await page.goto('https://oa.xyb2b.com/docs/pdfview2.x/web/pdfViewer.jsp?&pdfimagefileid=1886687&docisLock=false&canDownload=false&canPrint=false');

    }

    return isLogined

  }

  async toPDF() {

    // const result = await this.page.evaluate(x => {
    //   window.scroll(0, 100000)
    //   return Promise.resolve(1)
    // }, 7);

    await this.page.screenshot({
      path: 'workfile.png'
    })

    // const actionList = [
    //   {
    //     name: 'titleSelector',
    //     selector: '#viewer > div:nth-child(20)',
    //     delay: 4000,
    //     event: {
    //       type: 'screenshot',
    //       params: {
    //         path: 'workfile.png'
    //       }
    //     }
    //   }
    // ]

    // await playActions(this.page, actionList)
  }


}

module.exports = XyPDFDownloader;