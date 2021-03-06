const path = require('path');

const { getContent, parseMarkdown, writeContentToLocalFile } = require('./utils/helper');

const SocialBlogFactory = require('./social-blog-factory');

const XyPDFDownloader = require('./xy-pdf-downloader');

(async () => {

  const markdownPath = '/Users/lumin/lumin/lumin.repo/yf-blog-hugo/content/articles/what-is-promise/index.md';
  const content = getContent(markdownPath);
  function getSection(markdownPath) {
    const p = path.dirname(markdownPath) + '/';
    return (p.substr(p.indexOf('/content/')).replace('/content/', '/'));
  }
  const section = getSection(markdownPath)
  const parsed = parseMarkdown(content.body, 'https://www.lumin.tech', section)

  // await writeContentToLocalFile(parsed);


  // 掘金
  // const juejinBlog = new SocialBlogFactory('juejin');
  // await juejinBlog.init();
  // const isJueJinLogined = await juejinBlog.waitForLogin();
  // console.log('掘金登录状态：', isJueJinLogined)
  // await juejinBlog.publish({ ...content, body: parsed });

  // 简书
  // const jianshuBlog = new SocialBlogFactory('jianshu');
  // await jianshuBlog.init();
  // const isJianShuLogined = await jianshuBlog.waitForLogin();
  // console.log('简书登录状态：', isJianShuLogined)
  // await jianshuBlog.publish({ ...content, body: parsed });

  // 知乎
  // const zhihuBlog = new SocialBlogFactory('zhihu');
  // await zhihuBlog.init();
  // const isZhiHuLogined = await zhihuBlog.waitForLogin();
  // console.log('知乎登录状态：', isZhiHuLogined)
  // await zhihuBlog.publish({ ...content, body: parsed });

  // 头条
  // const toutiaoBlog = new SocialBlogFactory('toutiao');
  // await toutiaoBlog.init();
  // const isTouTiaoLogined = await toutiaoBlog.waitForLogin();
  // console.log('知乎登录状态：', isTouTiaoLogined)
  // await toutiaoBlog.publish({ ...content, body: parsed });

  // await browser.close();


  // 头条
  // const toutiaoBlog = new SocialBlogFactory('toutiao');
  // await toutiaoBlog.init();
  // const isTouTiaoLogined = await toutiaoBlog.waitForLogin();

  const xyPDFDownloader = new XyPDFDownloader()

  await xyPDFDownloader.init();
  await xyPDFDownloader.waitForLogin();
  await xyPDFDownloader.toPDF();

  // await browser.close();
})();