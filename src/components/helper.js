const posthtmlInlineCss = require('posthtml-inline-css')
const posthtml = require('posthtml')
const posthtmlRender = require('./posthtml-render')
// const Jsdom = require('jsdom').jsdom // wtf, npm run deploy failed on it
const pretty = require('pretty')
const debug = require('debug')('helper')
const fs = require('fs')
debug.enabled = true

async function fixGoogleHTML (html) {
  // console.log('fixGoogleHTML', html)
  let result = await posthtml().use(posthtmlInlineCss()).process(html)
  let resultHtml = posthtmlRender(result.tree[0].content, result.tree.options)
  // console.log(resultHtml)
  return resultHtml
}

function wrapWithStrong (html) {
  // const window = new Jsdom(html).defaultView
  const $ = require('jquery')//(window)
  let jq = $(`<div>${html}</div>`)
  let strongSpans = jq.find('span').filter(function () {
    return $(this).css('font-weight') === '700'
  })
  for (let span of strongSpans) {
    $(span).wrapInner('<strong>')
  }
  makeTitles($, jq)
  wrapLineheights($, jq)
  applyStylesToLists($, jq)
  removeClasses($, jq)
  return jq[0].outerHTML
}

function removeClasses ($, jq) {
  let els = jq.find('p, span')
  for (let el of els) {
    $(el).removeClass()
  }
  let uls = jq.find('ul')
  for (let ul of uls) {
    $(ul).attr('style', '')
  }
}

function applyStylesToLists ($, jq) {
  let html = jq[0].outerHTML
  // debug(html)
  let regexGlobal = /}\.([\w\d-_]*?)>li:before{content:[^{]*?counter\(.*?,([\w-]*)\)/g
  let regex = /}\.([\w\d-_]*?)>li:before{content:[^{]*?counter\(.*?,([\w-]*)\)/
  let bulletedListRegexGlobal = /.([\w\d-_]*?)>li:before{content:.{0,5}\\\\0025cf/g
  let bulletedListRegex = /.([\w\d-_]*?)>li:before{content:.{0,5}\\\\0025cf/
  const isThereSomeOls = html.match(regexGlobal)
  if (isThereSomeOls) {
    let lists = isThereSomeOls.map(i => i.match(regex))
    for (let list of lists) {
      const className = list[1]
      const listType = list[2]
      let uls = jq.find(`.${className}`)
      for (let ul of uls) {
        $(ul).attr('style', `list-style-type: ${listType};`)
      }
    }
  }
  const isThereSomeUls = html.match(bulletedListRegexGlobal)
  if (isThereSomeUls) {
    let bullets = isThereSomeUls.map(i => i.match(bulletedListRegex))
    for (let b of bullets) {
      let ols = jq.find(`.${b[1]}`)
      for (let ol of ols) {
        $(ol).attr('style', '')
        // $(ol).replaceWith($('<ul>' + ol.innerHTML + '</ul>'))
      }
    }
  }
}

function makeTitles ($, jq) {
  let titles = jq.find('p.title')
  for (let title of titles) {
    let style = $(title).attr('style')
    $(title).replaceWith($('<h1>' + title.innerHTML + '</h5>').attr('style', style))
  }
}

function wrapLineheights ($, jq) {
  let lineHeightPars = jq.find('p').filter(function () {
    return this.style['line-height']
  })
  for (let p of lineHeightPars) {
    $(p).wrapInner(`<span class="lineHeightSpan" style="line-height: ${p.style['line-height']}">`).css('line-height', '')
  }
}

async function doStuff (html) {
  try {
    html = await fixGoogleHTML(html)
    html = html.replace(/font-family:.?"\n?\W*?([\w|\s]*?)\W*?"/g, (match, fontName) => `font-family:‖${fontName}‖`)
    html = html.replace(/"/g, '\'').replace(/‖/g, '"')
    html = wrapWithStrong(html)
    debug('ok')
    html = pretty(html)
    html = html.replace(/"/g, '\'').replace(/&quot;/g, '"')
    html = html.replace(/font-weight:[\w ]*?;?/g, '')
    debug(html.match(/<style(.|\n)*?<\/style>/g))
    html = html.replace(/<style(.|\n)*?<\/style>/g, '')
    // console.log(html)
    return html
  } catch (e) {
    console.error(e)
  }
}

export default doStuff

// let html = fs.readFileSync('raw.html').toLocaleString()

// debug('\n\n\n\n\n')
// doStuff(html).then(e => console.log(e))
