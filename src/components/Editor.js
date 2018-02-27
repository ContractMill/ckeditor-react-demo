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
  while (/font-family:[^']*?(?=[;"])/.test(html)) {
    let original = html.match(/font-family:[^']*?(?=[;"])/)[0]
    let font = original.replace('font-family:', '').match(/.*?(?=[;,"])/)[0]
    html = html.replace(original, 'font-family:\'' + font + '\'')
  }
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
      content: 'Document content',
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
                extraPlugins: 'lineheight,enterkey',
                enterMode: 2, // CKEDITOR.ENTER_BR,
                shiftEnterMode: 1, // CKEDITOR.ENTER_P,
                line_height: '1px;100%;300%;normal;10em;10;100px'
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
