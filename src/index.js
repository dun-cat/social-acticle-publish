const puppeteer = require('puppeteer');
const path = require('path');

const { getContent, parseMarkdown } = require('./utils/helper');

const JuejinBlog = require('./blog-platform/juejin');


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1366,868', '--disable-web-security'],
    defaultViewport: null
  });

  const markdownPath = '/Users/lumin/lumin.repo/yf-blog-hugo/content/articles/webpack-module-federation/index.md';
  const content = getContent(markdownPath);

  function getSection(markdownPath) {
    const p = path.dirname(markdownPath) + '/';
    return (p.substr(p.indexOf('/content/')).replace('/content/', '/'));
  }

  const section = getSection(markdownPath)
  const parsed = parseMarkdown(content.body, 'https://www.lumin.tech', section)

  const juejinBlog = new JuejinBlog(browser);
  await juejinBlog.init(browser);
  const isLogined = await juejinBlog.waitForLogin();
  juejinBlog.publish({ ...content, body: parsed });

  console.log('掘金登录状态：', isLogined)

  // await browser.close();
})();