const fse = require('fs-extra');
const fm = require('front-matter');
const marked = require('marked');
const path = require('path');
const puppeteer = require('puppeteer')

const { writeFile } = require('./file');

marked.setOptions({
  xhtml: true
})

function getContent(filePath) {
  try {
    const mdstr = fse.readFileSync(filePath).toString();
    const { body, attributes } = fm(mdstr);

    return {
      body,
      attributes
    }
  } catch (error) {
    console.error(error);
  }
}

function sequenceExecTask(tasks) {
  return tasks.reduce(function (promise, task) {
    return promise.then(task)
  }, Promise.resolve())
}

function parseMarkdown(content, baseUrl, section) {
  const tokens = marked.lexer(content);

  function walk(tokens) {
    let formatedMarkdown = ''
    tokens.forEach(token => {
      let text = token.raw
      if (token.type === 'html' && token.raw.indexOf('<img') !== -1) {
        const src = token.raw.match(/src\=(?:\"|\')(.+?)(?:\"|\')/)[0].split('=')[1].replace(/(\'|")/g, "",);
        const formatedText = token.raw.replace(/src\=(?:\"|\')(.+?)(?:\"|\')/, `src='${baseUrl}${section}${src}'`)
        text = formatedText
      } else if (token.type === 'image') {
        const originFilePath = token.raw.match(/\((.*?)\)/)[1];
        const formatedText = token.raw.replace(/\((.*?)\)/g, `(${baseUrl}${section}${originFilePath})`)
        text = formatedText
      } else if (token.type === 'link' && !new RegExp("^(http|https)://", "i").test(token.href)) {
        const href = `${baseUrl}${token.href}`
        text = `[${token.text}](${href})`;
      } else if (token.type === 'paragraph' && Array.isArray(token.tokens)) {
        text = walk(token.tokens)
      }

      formatedMarkdown += text
    })
    return formatedMarkdown
  }

  const result = walk(tokens)

  return result
}

async function playActions(page, actions) {
  const actionsPromises = actions.map(({ name, selector, event, xpath, delay }) => {
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

  return await sequenceExecTask(actionsPromises)
}


function writeContentToLocalFile(body) {
  const filePath = path.join(__dirname, '../../temp/article.md');
  fse.ensureFileSync(filePath);
  return writeFile(filePath, body).then(() => filePath)
}

function createBrowser() {
  return puppeteer.launch({
    headless: false,
    args: ['--window-size=1366,868', '--disable-web-security'],
    defaultViewport: null
  });
}

module.exports = {
  getContent, sequenceExecTask, parseMarkdown, writeContentToLocalFile, createBrowser, playActions
}