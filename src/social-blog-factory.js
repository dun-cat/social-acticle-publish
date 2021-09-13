const JuejinBlog = require('./blog-platform/juejin');
const JianShuBlog = require('./blog-platform/jianshu');
const ZhiHuBlog = require('./blog-platform/zhihu');
const TouTiaoBlog = require('./blog-platform/toutiao');

class SocialBlogFactory {

  constructor(platform) {
    switch (platform) {
      case 'juejin':
        return new JuejinBlog();
      case 'jianshu':
        return new JianShuBlog();
      case 'zhihu':
        return new ZhiHuBlog();
      case 'toutiao':
        return new TouTiaoBlog();
    }
  }
}

module.exports = SocialBlogFactory