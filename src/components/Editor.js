import CKEditor from 'react-ckeditor-component'
import React from 'react'
import request from 'request-promise-native'
import { css } from 'emotion'
import { Button, Grid, Row, Col } from 'react-bootstrap'
import CKeditorInline from './CKEditorInline'
import $ from 'jquery'

const editorBlock = css`
  margin-right: auto;
  margin-left: auto;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
`

const headerEditor = css`
  border: 1px solid #aaa; 
  margin-top: 50px;
`

const buttonStyle = css`
  font-size: x-large;
  margin-top: 50px;
`

function htmlOptimization (html) {
  html = html.replace(/&quot;/g, '')
  // while (/font-family:[^']*?(?=[;"])/.test(html)) {
  //   let original = html.match(/font-family:[^']*?(?=[;"])/)[0]
  //   let font = original.replace('font-family:', '').match(/.*?(?=[;,"])/)[0]
  //   html = html.replace(original, 'font-family:\'' + font + '\'')
  // }
  let jq = $(`<div>${html}</div>`)
  jq.find('div[style="page-break-after:always"]').replaceWith('<div>[pageBreak]</div>')
  $('<br>').appendTo(jq.find('span.lineHeightSpan'))
  let result = jq[0].outerHTML
  while (/<\/span><br><\/span>/.test(result)) {
    result = result.replace('</span><br></span>', '</span></span>')
  }
  return result
}

function sendDocumentAndGetLink (document) {
  try {
    return request.post({
      url: 'https://script.google.com/macros/s/AKfycbyu0p0OFLepWOk4mULxu-AMHjAkx_HXOyqGR4JfYAUTgD9RPoA/exec',
      followAllRedirects: true,
      form: document
    })
  } catch (err) {
    console.error('->', err)
  }
}

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.updateContent = this.updateContent.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeHeader = this.onChangeHeader.bind(this)
    this.onButtonClick = this.onButtonClick.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.onCreateEditor = this.onCreateEditor.bind(this)
    this.editor = undefined
    this.state = {
      content:
      `<h1><img alt="Saturn V carrying Apollo 11" class="right" src="https://sdk.ckeditor.com/samples/assets/sample.jpg" style="float: right;" /> Apollo 11</h1>

      <p><strong>Apollo 11</strong> was the spaceflight that landed the first humans, Americans <a href="http://en.wikipedia.org/wiki/Neil_Armstrong">Neil Armstrong</a> and <a href="http://en.wikipedia.org/wiki/Buzz_Aldrin">Buzz Aldrin</a>, on the Moon on July 20, 1969, at 20:18 UTC. Armstrong became the first to step onto the lunar surface 6 hours later on July 21 at 02:56 UTC.</p>
      
      <p>Armstrong spent about <s>three and a half</s> two and a half hours outside the spacecraft, Aldrin slightly less; and together they collected 47.5 pounds (21.5&nbsp;kg) of lunar material for return to Earth. A third member of the mission, <a href="http://en.wikipedia.org/wiki/Michael_Collins_(astronaut)">Michael Collins</a>, piloted the <a href="http://en.wikipedia.org/wiki/Apollo_Command/Service_Module">command</a> spacecraft alone in lunar orbit until Armstrong and Aldrin returned to it for the trip back to Earth.</p>
      
      <h2>Broadcasting and <em>quotes</em> <a id="quotes" name="quotes"></a></h2>
      
      <p>Broadcast on live TV to a world-wide audience, Armstrong stepped onto the lunar surface and described the event as:</p>
      
      <blockquote>
      <p>One small step for [a] man, one giant leap for mankind.</p>
      </blockquote>
      
      <p>Apollo 11 effectively ended the <a href="http://en.wikipedia.org/wiki/Space_Race">Space Race</a> and fulfilled a national goal proposed in 1961 by the late U.S. President <a href="http://en.wikipedia.org/wiki/John_F._Kennedy">John F. Kennedy</a> in a speech before the United States Congress:</p>
      
      <blockquote>
      <p>[...] before this decade is out, of landing a man on the Moon and returning him safely to the Earth.</p>
      </blockquote>
      
      <h2>Technical details <a id="tech-details" name="tech-details"></a></h2>
      
      <table align="right" border="1" bordercolor="#ccc" cellpadding="5" cellspacing="0" style="border-collapse:collapse">
        <caption><strong>Mission crew</strong></caption>
        <thead>
          <tr>
            <th scope="col">Position</th>
            <th scope="col">Astronaut</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Commander</td>
            <td>Neil A. Armstrong</td>
          </tr>
          <tr>
            <td>Command Module Pilot</td>
            <td>Michael Collins</td>
          </tr>
          <tr>
            <td>Lunar Module Pilot</td>
            <td>Edwin &quot;Buzz&quot; E. Aldrin, Jr.</td>
          </tr>
        </tbody>
      </table>
      
      <p>Launched by a <strong>Saturn V</strong> rocket from <a href="http://en.wikipedia.org/wiki/Kennedy_Space_Center">Kennedy Space Center</a> in Merritt Island, Florida on July 16, Apollo 11 was the fifth manned mission of <a href="http://en.wikipedia.org/wiki/NASA">NASA</a>&#39;s Apollo program. The Apollo spacecraft had three parts:</p>
      
      <ol>
        <li><strong>Command Module</strong> with a cabin for the three astronauts which was the only part which landed back on Earth</li>
        <li><strong>Service Module</strong> which supported the Command Module with propulsion, electrical power, oxygen and water</li>
        <li><strong>Lunar Module</strong> for landing on the Moon.</li>
      </ol>
      
      <p>After being sent to the Moon by the Saturn V&#39;s upper stage, the astronauts separated the spacecraft from it and travelled for three days until they entered into lunar orbit. Armstrong and Aldrin then moved into the Lunar Module and landed in the <a href="http://en.wikipedia.org/wiki/Mare_Tranquillitatis">Sea of Tranquility</a>. They stayed a total of about 21 and a half hours on the lunar surface. After lifting off in the upper part of the Lunar Module and rejoining Collins in the Command Module, they returned to Earth and landed in the <a href="http://en.wikipedia.org/wiki/Pacific_Ocean">Pacific Ocean</a> on July 24.</p>
      
      <hr />
      <p><small>Source: <a href="http://en.wikipedia.org/wiki/Apollo_11">Wikipedia.org</a></small></p>
      `,
      header: ''
    }
    window.$ = $
  }

  updateContent (newContent) {
    this.setState({
      content: newContent
    })
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      file: nextProps.file,
      content: nextProps.file.content
    })
    this.editor.setData(nextProps.file.content)
    // this.forceUpdate()
  }

  async onButtonClick () {
    console.log(this.state.content)
    let result = htmlOptimization(this.state.content)
    console.log(result)
    result = await sendDocumentAndGetLink({
      document: result,
      header: this.state.header
    })
    window.location.href = result
  }

  onChange (evt) {
    const newContent = evt.editor.getData()
    this.updateContent(newContent)
  }

  onCreateEditor (evt) {
    this.editor = evt.editor
  }

  onChangeHeader (evt) {
    this.setState({
      header: evt.editor.getData()
    })
  }

  onBlur (evt) {
    // console.log('onBlur event called with event info: ', evt)
  }

  afterPaste (evt) {
    // console.log('afterPaste event called with event info: ', evt)
  }

  render () {
    return (
      <Grid className={editorBlock}>
        <Row>
          <Col mdOffset={2} md={8} sm={12}>
            <CKeditorInline
              activeClass={headerEditor}
              // content={'Edit header here'}
              events={{
                'change': this.onChangeHeader
              }}
              scriptUrl={'ckeditor/ckeditor.js'}
              config={{
                docType: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">',
                defaultLanguage: 'ru',
                height: 150
              }}
            >
              <p style={{'textAlign': 'right'}} >
                <span style={{'color': '#999999'}}>
                  Edit header here
                </span>
              </p>
            </CKeditorInline>
          </Col>
        </Row>
        <Row>
          <Col mdOffset={2} md={8} sm={12}>
            <CKEditor
              scriptUrl={'ckeditor/ckeditor.js'}
              // activeClass={editorSection}
              content={this.state.content}
              events={{
                'change': this.onChange,
                'configLoaded': this.onCreateEditor
              }}
              config={{
                height: 350,
                autoGrow_minHeight: 350,
                // autoGrow_maxHeight: 600,
                autoGrow_bottomSpace: 50,
                extraPlugins: 'autogrow,lineheight,enterkey,tabletoolstoolbar,autocorrect,colordialog,tableresize,stylesheetparser,googledocs,toc,bgimage,docprops',
                enterMode: 2, // CKEDITOR.ENTER_BR,
                shiftEnterMode: 1, // CKEDITOR.ENTER_P,
                line_height: '1.0;1.5;2.0;2.5;3.0',
                allowedContent: 'div{*}',
                fullPage: true
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              onClick={this.onButtonClick}
              className={buttonStyle}
            >
              Dowload DOCX
            </Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}
