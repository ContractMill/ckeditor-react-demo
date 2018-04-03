const posthtmlInlineCss = require('posthtml-inline-css')
const posthtml = require('posthtml')
const posthtmlRender = require('./posthtml-render')
// const Jsdom = require('jsdom').jsdom // wtf, npm run deploy failed on it
const pretty = require('pretty')
const debug = require('debug')('helper')
const _ = require('underscore')
debug.enabled = true

async function fixGoogleHTML (html) {
  // console.log('fixGoogleHTML', html)
  let result = await posthtml().use(posthtmlInlineCss()).process(html)
  let resultHtml = posthtmlRender(result.tree[0].content, result.tree.options)
  // console.log(resultHtml)
  return resultHtml
}

function wrapSpanStyles ($, jq) {
  const getStyleObject = element => {
    let style = element.attr('style')
    if (!style) return {}
    return JSON.parse('{' +
    style
      .replace(/;/g, ',')
      .replace(/ ?(.*?): ?(.*?)(,|$)/g, (match, p1, p2) => `"${p1}":"${p2.replace(/"/g, '')}",`)
      .slice(0, -1) +
    '}')
  }
  const whitelistStyles = selector => {
    jq.find(selector).each(function () {
      let el = $(this)
      let styles = getStyleObject(el)
      let lineHeight = styles['line-height']
      let textAlign = styles['text-align']
      let whiteList = _.pick(styles, 'text-align', 'height')
      el.removeAttr('class style')
      let style = ''
      _.mapObject(whiteList, (val, key) => {
        style += key + ':' + val + ';'
      })
      if (textAlign) {
        el.attr('style', style)
      }
      if (lineHeight) {
        if (!/\d+\.\d/.test(lineHeight)) {
          lineHeight += '.0'
        }
        if (/\d+\.\d+/.test(lineHeight)) {
          lineHeight = lineHeight.replace(/\.\d+/, '.0') // ??S
        }
        el.wrapInner(`<span class='lineHeightSpan' style='line-height:${lineHeight};'></span>`)
      }
    })
  }
  jq.find('span').each(function (index) {
    let span = $(this)
    let styles = getStyleObject(span)
    styles = _.omit(styles, 'font-weight', 'text-decoration-skip-ink', '-webkit-text-decoration-skip')
    span.removeAttr('class style color')
    let style = ''
    _.mapObject(styles, (value, key) => {
      if (key === 'font-family') {
        value = value + ',Helvetica,sans-serif'
      }
      switch (key) {
        case 'font-style': {
          switch (value) {
            case 'italic': return span.wrapInner('<em></em>')
          }
          break
        }
        case 'text-decoration': {
          switch (value) {
            case 'line-through': return span.wrapInner('<s></s>')
            case 'underline': return span.wrapInner('<u></u>')
          }
          break
        }
        case 'vertical-align': {
          switch (value) {
            case 'baseline': return
            case 'sub': return span.wrapInner('<sub></sub>')
            case 'super': return span.wrapInner('<sup></sup>')
          }
          break
        }
      }
      if (key === 'line-height') {
        span.addClass('lineHeightSpan')
        if (!/\d+\.\d/.test(value)) {
          value += '.0'
        }
        if (/\d+\.\d+/.test(value)) {
          value = value.replace(/\.\d+/, '.0') // ??S
        }
      }
      style += `${key}:${value};`
    })
    span.attr('style', style)
  })
  whitelistStyles('p')
  whitelistStyles('li')
}

function squashTable ($, jq) { // funcition to replace table styles from tbody to tds
  // get all tables
  let tables = jq.find('table')
  for (let table of tables) {
    // next get all elements from those tables
    let tds = $(table).find('td')
    for (let td of tds) {
      debug(td)
    }
  }
}

function wrapWithStrong (html) { // wraper and jquery initializer
  // const window = new Jsdom(html).defaultView
  const $ = require('jquery')// (window)
  let jq = $(`<div>${html}</div>`)
  let strongSpans = jq.find('span').filter(function () {
    return $(this).css('font-weight') === '700'
  })
  for (let span of strongSpans) {
    $(span).wrapInner('<strong>')
  }
  // set of functions on jquery to deal with html differencies
  insertPageBreaks($, jq)
  makeTitles($, jq)
  wrapLineheights($, jq)
  applyStylesToLists($, jq)
  removeClasses($, jq)
  wrapSpanStyles($, jq)
  return jq[0].outerHTML
}

function removeClasses ($, jq) {
  let els = jq.find('p, span, td, tr, table')
  for (let el of els) {
    $(el).removeClass()
  }
  let uls = jq.find('ul')
  for (let ul of uls) {
    $(ul).attr('style', '')
  }
}

function insertPageBreaks (content) {
  const $ = require('jquery')
  let jq = $(`<div>${content}</div>`)
  let dataCounter = 0
  $.map(jq.find('hr'), el => {
    dataCounter++
    let pageBreak = $('<div/>', {
      'aria-label': 'Page Break',
      'class': 'cke_pagebreak',
      'contenteditable': 'false',
      'data-cke-display-name': 'pagebreak',
      'style': 'page-break-after: always',
      'title': 'Page Break',
      'data-cke-pagebreak': dataCounter + ''
    })
    el.replaceWith(pageBreak[0])
  })
  return jq[0].outerHTML
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

async function htmlFixer (html) {
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

function splitColontituls (googleHtml) {
  debug(googleHtml)
  const $ = require('jquery')
  let html = $(googleHtml)
  let content = {
    body: '',
    header: '',
    footer: ''
  }
  let divs = html.find('div')
  if (divs.length > 2) throw new Error('Wrong google html pattern!')
  if (divs.length === 2) {
    content.header = divs[0].innerHTML
    content.footer = divs[1].innerHTML
    divs.remove()
  }
  content.body = html.html()
  return content
}

export {htmlFixer, splitColontituls, insertPageBreaks}
