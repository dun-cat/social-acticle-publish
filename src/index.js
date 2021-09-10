const puppeteer = require('puppeteer');
const path = require('path');

const { getContent, parseMarkdown } = require('./utils/helper');

const JuejinBlog = require('./blog-platform/juejin');
const JianShuBlog = require('./blog-platform/jianshu');


(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1366,868', '--disable-web-security'],
    defaultViewport: null
  });

  const markdownPath = '/Users/lumin/lumin.repo/yf-blog-hugo/content/articles/babel-ast-custom-plugin/index.md';
  const content = getContent(markdownPath);
  function getSection(markdownPath) {
    const p = path.dirname(markdownPath) + '/';
    return (p.substr(p.indexOf('/content/')).replace('/content/', '/'));
  }
  const section = getSection(markdownPath)
  const parsed = parseMarkdown(content.body, 'https://www.lumin.tech', section)

  const juejinBlog = new JuejinBlog(browser);
  await juejinBlog.init(browser);
  const isJueJinLogined = await juejinBlog.waitForLogin();
  console.log('掘金登录状态：', isJueJinLogined)
  juejinBlog.publish({ ...content, body: parsed });


  // const jianshuBlog = new JianShuBlog(browser);
  // await jianshuBlog.init(browser);
  // const isJianShuLogined = await jianshuBlog.waitForLogin();
  // console.log('简书登录状态：', isJianShuLogined)
  // jianshuBlog.publish({ ...content, body: parsed });



  // await browser.close();
})();