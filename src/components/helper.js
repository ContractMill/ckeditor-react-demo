const posthtmlInlineCss = require('posthtml-inline-css')
const posthtml = require('posthtml')
const posthtmlRender = require('./posthtml-render')
// const Jsdom = require('jsdom').jsdom
const pretty = require('pretty')
const debug = require('debug')('helper')
debug.enabled = true

async function fixGoogleHTML (html) {
  console.log('fixGoogleHTML', html)
  let result = await posthtml().use(posthtmlInlineCss()).process(html)
  let resultHtml = posthtmlRender(result.tree[0].content[1].content, result.tree.options)
  return resultHtml
}

function wrapWithStrong (html) {
  // const window = new Jsdom(html).defaultView
  const $ = require('jquery') // (window)
  let jq = $(`<div>${html}</div>`)
  let strongSpans = jq.find('span').filter(function () {
    return $(this).css('font-weight') === '700'
  })
  for (let span of strongSpans) {
    $(span).wrapInner('<strong>')
  }
  makeTitles($, jq)
  wrapLineheights($, jq)
  return jq[0].outerHTML
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

export default async function (html) {
  try {
    html = await fixGoogleHTML(html)
    html = html.replace(/font-family:.?"\n?\W*?([\w|\s]*?)\W*?"/g, (match, fontName) => `font-family:‖${fontName}‖`)
    html = html.replace(/"/g, '\'').replace(/‖/g, '"')
    html = wrapWithStrong(html)
    html = pretty(html)
    html = html.replace(/"/g, '\'').replace(/&quot;/g, '"')
    html = html.replace(/font-weight:[\w ]*?;?/g, '')
    html = html.replace(/<style(.|\n)*?<\/style>/, '')
    // console.log(html)
    return html
  } catch (e) {
    console.error(e)
  }
}
